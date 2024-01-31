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
    let response
    try {
      response = await squareClient.catalogApi.batchRetrieveCatalogObjects({
        objectIds: productSetIds[i],
        includeRelatedObjects: false,
      })
    } catch (error) {
      throw new SquareApiError(
        error?.errors[0].detail || 'error while calling the Square API'
      )
    }

    // const response = await squareClient.catalogApi.batchRetrieveCatalogObjects({
    //   objectIds: productSetIds[i],
    //   includeRelatedObjects: false,
    // })

    // if (!response) {
    //   throw new SquareApiError('error while calling the Square API')
    // }
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
  let response
  try {
    response = await squareClient.catalogApi.retrieveCatalogObject(
      productSetId,
      false
    )
  } catch (error) {
    throw new SquareApiError(
      error?.errors[0].detail || 'error while calling the Square API'
    )
  }

  // const response = await squareClient.catalogApi.retrieveCatalogObject(
  //   productSetId,
  //   false
  // )

  // if (!response) {
  //   throw new SquareApiError('error while calling the Square API')
  // }

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

  let upsertResponse
  try {
    upsertResponse = await squareClient.catalogApi.upsertCatalogObject({
      idempotencyKey: nanoid(),
      object: newProductSet,
    })
  } catch (error) {
    throw new SquareApiError(
      error?.errors[0].detail || 'error while calling the Square API'
    )
  }

  // const upsertResponse = await squareClient.catalogApi.upsertCatalogObject({
  //   idempotencyKey: nanoid(),
  //   object: newProductSet,
  // })

  // if (!upsertResponse) {
  //   throw new SquareApiError('error while calling the Square API')
  // }

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
  const discountId = req.params?.id
  const vendorLocations = req.user.locations
  const user = req.user
  const formData = req.body

  //now let's see if an existing discount is present. This is used to populate pricingRuleData
  //if the discount exists, this also populates pricingRuleObj, discountObj, productSetObj
  let discount, pricingRuleObj, discountObj, productSetObj
  let pricingRuleData, discountData, productSetData
  if (discountId) {
    discount = await Discount.findOne({
      pricingRuleId: discountId,
      createdBy: req.user.userId,
    })
    if (!discount) {
      throw new NotFoundError(`no discount with id : ${req.params.id}`)
    }

    let retrieveResponse
    try {
      retrieveResponse =
        await squareClient.catalogApi.batchRetrieveCatalogObjects({
          objectIds: [
            discount.pricingRuleId,
            discount.discountId,
            discount.productSetId,
          ],
          includeRelatedObjects: false,
        })
    } catch (error) {
      throw new SquareApiError(
        error?.errors[0].detail || 'error while retrieving discount'
      )
    }

    pricingRuleObj = retrieveResponse.result.objects.find(
      (el) => el.type === 'PRICING_RULE'
    )
    discountObj = retrieveResponse.result.objects.find(
      (el) => el.type === 'DISCOUNT'
    )
    productSetObj = retrieveResponse.result.objects.find(
      (el) => el.type === 'PRODUCT_SET'
    )

    pricingRuleData = {
      name: `[${user.name}] ${formData.title}`,
      discountId: pricingRuleObj.pricingRuleData.discountId,
      matchProductsId: pricingRuleObj.pricingRuleData.matchProductsId,
    }
  } else {
    pricingRuleData = {
      name: `[${user.name}] ${formData.title}`,
      discountId: '#new_discount',
      matchProductsId: '#new_match_products',
    }
  }

  // discountData and productSetData don't reference on any ids so they are the same in both cases:
  discountData = {
    name: `[${user.name}] ${formData.title}`,
    modifyTaxBasis: 'MODIFY_TAX_BASIS',
  }

  productSetData = {}

  //this part is the logic for assembling the rules, and is the same for both cases (whether new or exisitng discount)
  if (!formData?.alwaysActive) {
    pricingRuleData.validFromDate = formData.discountStart
    pricingRuleData.validFromLocalTime = '00:00:00'
    pricingRuleData.validUntilDate = formData.discountEnd
    pricingRuleData.validUntilLocalTime = '23:59:59'
  }

  if (formData.condition == 'purchase-items') {
    if (formData.numItemsCondition == 'exact') {
      productSetData.quantityExact = formData.minItems
    } else if (formData.numItemsCondition == 'min') {
      productSetData.quantityMin = formData.minItems
    }
  }

  if (formData.eligibleItems == 'all-items') {
    productSetData.productIdsAny = [user.squareId]
  } else {
    productSetData.productIdsAny = formData.selectionList
  }

  if (formData.discountDetails == 'percentage') {
    discountData.discountType = 'FIXED_PERCENTAGE'
    discountData.percentage = formData.percentageOff
  } else if (formData.discountDetails == 'amount') {
    discountData.discountType = 'FIXED_AMOUNT'
    discountData.amountMoney = {
      amount: Math.round(parseFloat(formData.amountOff) * 100),
      currency: 'CAD',
    }
  }

  if (formData.minSpend == 'min-spend-true') {
    pricingRuleData.minimumOrderSubtotalMoney = {
      amount: Math.round(parseFloat(formData.minSpendAmount) * 100),
      currency: 'CAD',
    }
  }

  //putting together the objects:
  if (discountId) {
    pricingRuleObj.pricingRuleData = pricingRuleData
    discountObj.discountData = discountData
    productSetObj.productSetData = productSetData
  } else {
    pricingRuleObj = {
      type: 'PRICING_RULE',
      id: '#new_pricing_rule',
      pricingRuleData: pricingRuleData,
      presentAtAllLocations: false,
      presentAtLocationIds: vendorLocations,
    }

    discountObj = {
      type: 'DISCOUNT',
      id: '#new_discount',
      discountData: discountData,
      presentAtAllLocations: false,
      presentAtLocationIds: vendorLocations,
    }

    productSetObj = {
      type: 'PRODUCT_SET',
      id: '#new_match_products',
      productSetData: productSetData,
      presentAtAllLocations: false,
      presentAtLocationIds: vendorLocations,
    }
  }

  //the actual action of updating:
  let response
  try {
    response = await squareClient.catalogApi.batchUpsertCatalogObjects({
      idempotencyKey: nanoid(),
      batches: [
        {
          objects: [pricingRuleObj, discountObj, productSetObj],
        },
      ],
    })
  } catch (error) {
    throw new SquareApiError(
      error?.errors[0].detail || 'error while creating discounts'
    )
  }

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
    discount = await Discount.create({
      pricingRuleId: newPricingRuleId,
      discountId: newDiscountId,
      productSetId: newProductSetId,
      createdBy: req.user.userId,
      storewide: req.user.role === 'admin',
    })
  }

  return res.status(StatusCodes.CREATED).json({ discount })
}

export const getDiscount = async (req, res) => {
  const discount = await Discount.findOne({
    pricingRuleId: req.params.id,
    createdBy: req.user.userId,
  })
  if (!discount) {
    throw new NotFoundError(`no discount with id : ${req.params.id}`)
  }

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
  res.status(StatusCodes.OK).json({ categories })
}
