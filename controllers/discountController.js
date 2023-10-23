import Discount from '../models/DiscountModel.js'
import { StatusCodes } from 'http-status-codes'
import {
  FILE_TYPE,
  FILE_UPLOAD_STATUS,
  ALL_LOCATIONS,
} from '../utils/constants.js'
import { nanoid } from 'nanoid'
import { squareClient } from '../utils/squareUtils.js'
import JSONBig from 'json-bigint'
import {
  BadRequestError,
  NotFoundError,
  UnauthorizedError,
  SquareApiError,
} from '../errors/customError.js'
import User from '../models/UserModel.js'

export const getAllDiscounts = async (req, res) => {
  const discounts = await Discount.find({ createdBy: req.user.userId })
  console.log(discounts)

  if (discounts.length == 0) {
    return res.status(StatusCodes.OK).json(discounts)
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

    res.status(StatusCodes.OK).json(parsedResponse)
  } catch (error) {
    console.log(error)
    throw new SquareApiError('error while calling the Square API')
  }
}

export const upsertDiscount = async (req, res) => {
  try {
    const response = await squareClient.catalogApi.batchUpsertCatalogObjects({
      idempotencyKey: nanoid(),
      batches: [
        {
          objects: req.body,
        },
      ],
    })

    //this is a new discount, save the object IDs:
    if (response?.result?.idMappings) {
      console.log(response.result.idMappings)
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

      console.log(newPricingRuleId)

      req.body.createdBy = req.user.userId
      const discount = await Discount.create({
        pricingRuleId: newPricingRuleId,
        discountId: newDiscountId,
        productSetId: newProductSetId,
        createdBy: req.user.userId,
      })
      return res.status(StatusCodes.CREATED).json({ discount })
    }

    let parsedResponse
    if (response.result) {
      parsedResponse = JSONBig.parse(JSONBig.stringify(response.result))
    } else {
      parsedResponse = []
    }
    console.log(parsedResponse)
    res.status(StatusCodes.OK).json(parsedResponse)
  } catch (error) {
    console.log(error)
    throw new SquareApiError('error while calling the Square API')
  }

  //res.status(StatusCodes.OK).json({ msg: req.body })
}

export const getDiscount = async (req, res) => {
  const discount = await Discount.findOne({ pricingRuleId: req.params.id })
  console.log(discount)

  try {
    const response = await squareClient.catalogApi.retrieveCatalogObject(
      req.params.id,
      true
    )
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
  console.log(discount.createdBy.toString(), req.user.userId)
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
