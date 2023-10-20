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
  //console.log(discounts)
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
      const newPricngRuleObj = response.result.idMappings
        .filter((el) => {
          return el.clientObjectId.includes('pricing_rule')
        })
        .flat()

      const newPricingRuleId = newPricngRuleObj[0].objectId

      console.log(newPricingRuleId)

      req.body.createdBy = req.user.userId
      const discount = await Discount.create({
        pricingRuleId: newPricingRuleId,
        createdBy: req.user.userId,
      })
      res.status(StatusCodes.CREATED).json({ discount })
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
