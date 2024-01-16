import { squareClient } from '../utils/squareUtils.js'
import { StatusCodes } from 'http-status-codes'
import { nanoid } from 'nanoid'
import {
  BadRequestError,
  NotFoundError,
  UnauthorizedError,
  SquareApiError,
} from '../errors/customError.js'
import JSONBig from 'json-bigint'
import Location from '../models/LocationModel.js'

const productVariations = [
  '5SFHJSVMCIT6L6NHBCRPXAWB',
  'B6RSP2PW65UHNQWE3KFDLGLS',
  'DZBE5VNBLKPRTQVQJ47VICZW',
  'ITGZCKMTV56EXIQ6ADJGWB6U',
  'A3IMZQZPEYDEOY7USQKKT7DW',
  'KMYIFU6GYTBAMBG3AESEUZ2J',
  '5M6U7K4J7MEP6J466SPSK7SG',
  'MCQW5PK7SC27OCWXQRQ36NS7',
  'WVKHL2AAEP6LB64Z2I5DC3KW',
  'EUNPJSKNHSJ4AAZD3VZV55LZ',
  'Y3JI77FJMFQHCTGFHRQEJTA2',
  'F46VKV7JSSMDRFPL35AXJKJO',
  'YPYPDZ637JSFWP4EOY6G52L3',
  'AVKOMKBZHA4QRLJUQ6Z2OGJQ',
  'XVIO33SGOHXRYHJIZNVYRPMQ',
  'HWVKOMUBZGTE4RSOB52GHEO4',
  'GIWPBNQ3U7FE67PSS4SOOJZQ',
  'AEZTPZRCXQII7MY37YCPZU2V',
  'Y2Z4YH25LS7XIKONOJ66W4IG',
  '3BZTWQR4EFBA7DFALDJY7LAR',
  'R23MCFB4HE5GTJRB3PP5KON6',
  'E4KLMJ4DVL5PTPHJ75NMUD5Q',
  'DZ22YJR4KIWVPO3BMIOHYF2C',
  'QAUU4AML3QBPQP62PSWAEYSY',
  'MX2A7XTD2RAO4WEA2CSDL6PT',
  'O5APRSU7T3QQCCLDMUI7V4P4',
  'XDI2KEZHIIC24ADWGES5VA75',
  'ZJCN4IZ3WLQRNNYXM3GYUDQ4',
  'RIEVEGDYIDOFWZGRHAQQ6B2L',
  'EAZ7TZ7FY2Z77LVJFBC5LTLJ',
  'SK5YKFAZ2PXMVXSW43QOZAIE',
  'WNBTBGQZWOKO5LS67PZSEQVX',
  'LXH3CDSLBUMDLVSZLOWZKPFG',
  'I3L2WYUSISO77BUILHCQA7SG',
  'GIZ5Z6S6ANX5XP2W4J46GO7Y',
  'DRTP3QPRZDEQNZTBQCE3BGWF',
  'AUUMWRK4SY7CIJLTP5R6OIBZ',
  'KT7W2SXOIRUZCGYZHGPQADLL',
  'W4CL55A3RVDFDI7ZR66YYGAR',
  '2KIEW3VB5Q2UPJGB5MT22KKS',
  '2WGBFTARD4Q5WW37RRSAL4N6',
  'B2NYKSDRWO7MRH5K3RDBFPP4',
  'QXZYGFBKOCTXF2KUDP5M3BNY',
  'BFSIF2EVKAHECVL4IENEAKXD',
  'C27XWSIJSRZEGX4MYNQACB7R',
  'IHIWQWQJZIQF73QNM4FYZ6GU',
  'EVOC5N3EE5DNRTTN6FSRRTKP',
  'VX4X7PH2S5M7THG3JAJPTKLZ',
  'XCIAJTYESP64BLRJFBKVC25G',
  '2VZUKB6FWYUEXYS54QURNXHX',
]

export const generateTestOrders = async (req, res) => {
  const allLocations = await Location.find()
  let locationInd = getRandomInt(allLocations.length)
  let chosenLocation = allLocations[locationInd]._id

  const numOfProducts = getRandomInt(5)

  const lineItems = []

  for (let i = 0; i <= numOfProducts; i++) {
    let itemInd = getRandomInt(productVariations.length)
    lineItems.push({
      quantity: '1',
      catalogObjectId: productVariations[itemInd],
      itemType: 'ITEM',
    })
  }
  // const arrayEmpty = new Array(numOfProducts)

  // const lineItems = arrayEmpty.map((el) => {
  //   let itemInd = getRandomInt(productVariations.length)
  //   return {
  //     quantity: '1',
  //     catalogObjectId: productVariations[itemInd],
  //     itemType: 'ITEM',
  //   }
  // })

  // console.log(lineItems)

  // return res.status(StatusCodes.OK).json({ msg: 'ok' })

  try {
    const orderResponse = await squareClient.ordersApi.createOrder({
      order: {
        locationId: chosenLocation,
        customerId: 'R0WM5P8MTP3SCHVQZM4FVEC970', //always the default test customer
        lineItems: lineItems,
      },
    })

    const orderId = orderResponse.result.order.id
    const netAmountDue = orderResponse.result.order.netAmountDueMoney.amount

    const parsedResponse = JSONBig.parse(
      JSONBig.stringify(orderResponse.result.order)
    )

    // create payment and pay the order
    try {
      const response = await squareClient.paymentsApi.createPayment({
        sourceId: 'CASH',
        idempotencyKey: nanoid(),
        amountMoney: {
          amount: netAmountDue,
          currency: 'CAD',
        },
        orderId: orderId,
        customerId: 'R0WM5P8MTP3SCHVQZM4FVEC970', //always the default test customer
        locationId: chosenLocation,
        cashDetails: {
          buyerSuppliedMoney: {
            amount: netAmountDue,
            currency: 'CAD',
          },
        },
      })

      // console.log(response.result)
      res.status(StatusCodes.OK).json({ parsedResponse })
    } catch (error) {
      console.log(error)
    }

    // res.status(StatusCodes.OK).json({ parsedResponse })
  } catch (error) {
    console.log(error)
  }
}

function getRandomInt(max) {
  return Math.floor(Math.random() * max)
}

// needed later:
import Order from '../models/OrderModel.js'
import User from '../models/UserModel.js'
import day from 'dayjs'

export const copyOrders = async (req, res) => {
  const allLocations = await Location.find()
  const startDate = day().subtract(2, 'day')
  // const oldOrders = await Order.find({
  //   updatedAt: { $gte: startDate.toDate() },
  // }).sort('-updatedAt')
  // return res.status(StatusCodes.OK).json({ oldOrders })

  const locationIds = allLocations.map((el) => {
    return el._id
  })

  const searchOrders = await squareClient.ordersApi.searchOrders({
    locationIds: locationIds,
    query: {
      filter: {
        stateFilter: {
          states: ['COMPLETED'],
        },
        dateTimeFilter: {
          updatedAt: {
            startAt: startDate.format('YYYY-MM-DD'),
          },
        },
      },
      sort: {
        sortField: 'UPDATED_AT',
        sortOrder: 'ASC',
      },
    },
  })

  if (!searchOrders) {
    throw new SquareApiError('error while calling the Square API')
  }

  const allOrders = searchOrders.result.orders

  for (let i = 0; i < allOrders.length; i++) {
    const existingOrder = await Order.findOne({ orderId: allOrders[i].id })
    const currOrderVersion = allOrders[i]?.version || 0
    if (existingOrder && currOrderVersion == existingOrder.version) {
      //if existing order is there and version is the same then just skip it
      continue
    }

    const orderItemsPromise = allOrders[i].lineItems.map(async (item) => {
      if (!item?.catalogObjectId) {
        // throw new SquareApiError('no variation ID defined')
        hasError = true
        return res.status(StatusCodes.CREATED).json({ msg: 'ok' })
      }
      const itemResponse = await squareClient.catalogApi.retrieveCatalogObject(
        item.catalogObjectId,
        false
      )

      let vendorName =
        itemResponse.result.object.customAttributeValues.vendor_name.stringValue
      const user = await User.findOne({ name: vendorName })

      if (!user) {
        hasError = true
        throw new NotFoundError('user not found')
      }

      let variationName

      if (item.variationName !== '' && item.name === item.variationName) {
        variationName = ''
      } else {
        variationName = item.variationName
      }

      return {
        itemName: item.name,
        itemVariationName: variationName,
        itemVariationId: item.catalogObjectId,
        itemId: itemResponse.result.object.itemVariationData.itemId,
        itemSku: itemResponse.result.object.itemVariationData.sku,
        quantity: item.quantity,
        basePrice: Number(item.basePriceMoney.amount),
        totalDiscount: Number(item.totalDiscountMoney.amount),
        totalMoney: Number(
          item.totalMoney.amount - item.totalServiceChargeMoney.amount
        ),
        itemVendor: user._id,
      }
    })
    const orderItems = await Promise.all(orderItemsPromise)
    const orderInfo = {
      orderId: allOrders[i].id,
      location: allOrders[i].locationId,
      orderDate: allOrders[i].createdAt,
      version: allOrders[i]?.version || 0,
      orderItems: orderItems,
    }

    let newOrder
    if (existingOrder) {
      //find by ID and update
      newOrder = await Order.findByIdAndUpdate(allOrders[i].id, orderInfo, {
        new: true,
      })
    } else {
      //create new order
      newOrder = await Order.create(orderInfo)
    }
  }

  const parsedResponse = JSONBig.parse(JSONBig.stringify(searchOrders.result))
  // console.log(searchOrders.result)
  res.status(StatusCodes.OK).json({ msg: 'ok' })
}
