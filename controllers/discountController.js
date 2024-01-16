import Discount from '../models/DiscountModel.js'
import User from '../models/UserModel.js'
import { StatusCodes } from 'http-status-codes'
import { nanoid } from 'nanoid'
import { squareClient } from '../utils/squareUtils.js'
import JSONBig from 'json-bigint'
import {
  BadRequestError,
  NotFoundError,
  UnauthorizedError,
  SquareApiError,
} from '../errors/customError.js'
import agenda from '../jobs/agenda.js'
import day from 'dayjs'

export const getStorewideDiscounts = async (req, res) => {
  const discounts = await Discount.find({ storewide: true })

  if (discounts.length == 0) {
    return res.status(StatusCodes.OK).json({
      storewideDiscounts: discounts,
    })
  }
  const productSetIds = discounts.map((el) => [
    el.pricingRuleId,
    el.productSetId,
  ])

  let parsedResponse = []
  for (let i = 0; i < productSetIds.length; i++) {
    const response = await squareClient.catalogApi.batchRetrieveCatalogObjects({
      objectIds: productSetIds[i],
      includeRelatedObjects: false,
    })

    if (!response) {
      throw new SquareApiError('error while calling the Square API')
    }
    let pricingRule = response.result.objects.find((el) => {
      return el.type === 'PRICING_RULE'
    })

    const discountHasNotPassed = day().isBefore(
      day(pricingRule.pricingRuleData.validUntilDate).add(15, 'day')
    )

    if (response.result && discountHasNotPassed) {
      parsedResponse.push(
        JSONBig.parse(JSONBig.stringify(response.result.objects))
      )
    }
  }

  parsedResponse.sort((a, b) => {
    const indexA = a.findIndex((el) => el.type == 'PRICING_RULE')
    const indexB = b.findIndex((el) => el.type == 'PRICING_RULE')
    const startDateA = day(
      a[indexA].pricingRuleData.validFromDate,
      'YYYY-MM-DD'
    )
    const startDateB = day(
      b[indexB].pricingRuleData.validFromDate,
      'YYYY-MM-DD'
    )
    return startDateA.isBefore(startDateB) ? -1 : 1
  })

  res.status(StatusCodes.OK).json({
    storewideDiscounts: parsedResponse,
  })
}

export const storewideOptInOut = async (req, res) => {
  const { productSetId, optIn } = req.body

  const response = await squareClient.catalogApi.retrieveCatalogObject(
    productSetId,
    false
  )

  if (!response) {
    throw new SquareApiError('error while calling the Square API')
  }

  let newProductSetIds
  if (response.result.object.productSetData.productIdsAny) {
    newProductSetIds =
      response.result.object.productSetData.productIdsAny.filter((el) => {
        return el !== req.user.squareId
      })
  } else {
    newProductSetIds = []
  }

  if (optIn) {
    newProductSetIds.push(req.user.squareId)
  }

  const newProductSet = response.result.object
  newProductSet.productSetData.productIdsAny = newProductSetIds

  const upsertResponse = await squareClient.catalogApi.upsertCatalogObject({
    idempotencyKey: nanoid(),
    object: newProductSet,
  })

  if (!upsertResponse) {
    throw new SquareApiError('error while calling the Square API')
  }

  res.status(StatusCodes.OK).json({
    msg: 'ok',
  })
}

export const getAllDiscounts = async (req, res) => {
  const queryObj = { createdBy: req.user.userId }
  // setup pagination
  const page = Number(req.query.page) || 1
  const limit = Number(req.query.limit) || 50
  const skip = (page - 1) * limit

  const discounts = await Discount.find(queryObj).skip(skip).limit(limit)
  const totalItems = await Discount.countDocuments(queryObj)
  const numOfPages = Math.ceil(totalItems / limit)

  if (discounts.length == 0) {
    return res.status(StatusCodes.OK).json({
      discounts,
      totalItems: 0,
      numOfPages: 1,
      currentPage: 1,
    })
  }

  const discountIds = discounts.map((el) => el.pricingRuleId)

  try {
    const response = await squareClient.catalogApi.batchRetrieveCatalogObjects({
      objectIds: discountIds,
      includeRelatedObjects: false,
    })
    let parsedResponse

    if (response.result) {
      parsedResponse = JSONBig.parse(JSONBig.stringify(response.result.objects))
    } else {
      parsedResponse = []
    }

    res.status(StatusCodes.OK).json({
      discounts: parsedResponse,
      totalItems,
      numOfPages,
      currentPage: page,
    })
  } catch (error) {
    console.log(error)
    throw new SquareApiError('error while calling the Square API')
  }
}

export const upsertDiscount = async (req, res) => {
  const vendorLocations = req.user.locations
  // productData.itemData.variations[i].presentAtAllLocations = false
  // productData.itemData.variations[i].presentAtLocationIds =
  //   vendorLocations

  let { pricingRuleObj, discountObj, productSetObj } = req.body
  pricingRuleObj.presentAtAllLocations = false
  pricingRuleObj.presentAtLocationIds = vendorLocations
  discountObj.presentAtAllLocations = false
  discountObj.presentAtLocationIds = vendorLocations
  productSetObj.presentAtAllLocations = false
  productSetObj.presentAtLocationIds = vendorLocations

  // console.log(vendorLocations)
  // console.log(pricingRuleObj, discountObj, productSetObj)
  // return res.status(StatusCodes.CREATED).json({ msg: 'ok' })
  try {
    const response = await squareClient.catalogApi.batchUpsertCatalogObjects({
      idempotencyKey: nanoid(),
      batches: [
        {
          objects: [pricingRuleObj, discountObj, productSetObj],
        },
      ],
    })

    //this is a new discount, save the object IDs:
    if (response?.result?.idMappings) {
      const newPricngRuleObj = response.result.idMappings
        .filter((el) => {
          return el.clientObjectId.includes('pricing_rule')
        })
        .flat()
      const newPricingRuleId = newPricngRuleObj[0].objectId

      const newDiscountObj = response.result.idMappings
        .filter((el) => {
          return el.clientObjectId.includes('new_discount')
        })
        .flat()
      const newDiscountId = newDiscountObj[0].objectId

      const newProductSetObj = response.result.idMappings
        .filter((el) => {
          return el.clientObjectId.includes('new_match_products')
        })
        .flat()
      const newProductSetId = newProductSetObj[0].objectId

      req.body.createdBy = req.user.userId
      const discount = await Discount.create({
        pricingRuleId: newPricingRuleId,
        discountId: newDiscountId,
        productSetId: newProductSetId,
        createdBy: req.user.userId,
        storewide: req.user.role === 'admin',
      })
      if (req.user.role === 'admin') {
        //this is a storewide discount, send an email to everyone to let them know they should opt in/out

        agenda.now('storewide sale email', {
          discountName: pricingRuleObj.pricingRuleData.name.replace(
            '[Administrator] ',
            ''
          ),
          validFromDate: pricingRuleObj.pricingRuleData.validFromDate,
          validUntilDate: pricingRuleObj.pricingRuleData.validUntilDate,
          firstLine: 'Our store is hosting a new store-wide sale!',
        })

        const validFromDate = pricingRuleObj.pricingRuleData.validFromDate
        const decisionDate = day(validFromDate, 'YYYY-MM-DD')
          .subtract(8, 'day')
          .toDate()

        agenda.schedule(decisionDate, 'storewide sale email', {
          discountName: pricingRuleObj.pricingRuleData.name.replace(
            '[Administrator] ',
            ''
          ),
          validFromDate: pricingRuleObj.pricingRuleData.validFromDate,
          validUntilDate: pricingRuleObj.pricingRuleData.validUntilDate,
          firstLine:
            'This is a reminder that the decision cut-off date for the store-wide sale is tomorrow.',
        })
      }
      return res.status(StatusCodes.CREATED).json({ discount })
    }

    let parsedResponse
    if (response.result) {
      parsedResponse = JSONBig.parse(JSONBig.stringify(response.result))
    } else {
      parsedResponse = []
    }
    res.status(StatusCodes.OK).json(parsedResponse)
  } catch (error) {
    console.log(error)
    throw new SquareApiError('error while calling the Square API')
  }

  //res.status(StatusCodes.OK).json({ msg: req.body })
}

export const getDiscount = async (req, res) => {
  const discount = await Discount.findOne({
    pricingRuleId: req.params.id,
    createdBy: req.user.userId,
  })

  try {
    const response = await squareClient.catalogApi.batchRetrieveCatalogObjects({
      objectIds: [
        discount.pricingRuleId,
        discount.discountId,
        discount.productSetId,
      ],
      includeRelatedObjects: false,
    })
    let parsedResponse
    if (response.result) {
      parsedResponse = JSONBig.parse(JSONBig.stringify(response.result))
    } else {
      parsedResponse = []
    }

    res.status(StatusCodes.OK).json(parsedResponse)
  } catch (error) {
    console.log(error)
    throw new SquareApiError('error while calling the Square API')
  }
}

export const deleteDiscount = async (req, res, next) => {
  const discount = await Discount.findOne({ pricingRuleId: req.params.id })

  if (!discount) {
    throw new NotFoundError(`no discount with id : ${req.params.id}`)
  }
  if (req.user.userId != discount.createdBy.toString()) {
    throw new UnauthorizedError('not authorized to access this route')
  }

  const squareResponse =
    await squareClient.catalogApi.batchDeleteCatalogObjects({
      objectIds: [req.params.id, discount.discountId, discount.productSetId],
    })
  if (!squareResponse) {
    throw new SquareApiError('error while calling the Square API')
  }

  const mongoRemovedDiscount = await Discount.findByIdAndDelete(discount._id)

  const parsedResponse = JSONBig.parse(JSONBig.stringify(squareResponse.result))

  res.status(StatusCodes.OK).json({
    squareResponse: parsedResponse,
    mongoResponse: mongoRemovedDiscount,
  })
}

export const getDiscountCategories = async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(StatusCodes.OK).json({ categories: [] })
  }
  const categories = await User.find({}, { name: 1, squareId: 1 })
  // const userWithoutPassword = user.toJSON()
  res.status(StatusCodes.OK).json({ categories })
}
