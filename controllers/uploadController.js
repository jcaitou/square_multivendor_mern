import { StatusCodes } from 'http-status-codes'
import FileAction from '../models/FileActionModel.js'
import {
  FILE_TYPE,
  FILE_UPLOAD_STATUS,
  ALL_LOCATIONS,
} from '../utils/constants.js'
import { nanoid } from 'nanoid'
import { squareClient } from '../utils/squareUtils.js'
import csv from 'csvtojson'
import createCsvWriter from 'csv-writer'
import { UnauthorizedError } from '../errors/customError.js'

//const vendorLocations = ['LVBCM6VKTYDHH', 'L1NN4715DCC58']

export const batchUpdateUploadFile = async (req, res, next) => {
  // const fileAction = await FileAction.create({
  //   fileType: req.body.type,
  //   fileName: req.file.filename,
  //   status: FILE_UPLOAD_STATUS.RUNNING,
  //   resultsFileName: null,
  //   createdBy: req.user.userId,
  // })

  if (req.body.type == 'product') {
    batchUpdateProducts(
      req.user.squareName,
      req.user.squareId,
      req.user.locations,
      req.file.filename,
      //fileAction.id
      'fileAction.id'
    )
  } else if (req.body.type == 'inventory-recount') {
    batchUpdateInventory(
      req.user.squareName,
      req.user.squareId,
      req.user.locations,
      req.file.filename,
      //fileAction.id
      'fileAction.id'
    )
  }

  // res.status(StatusCodes.CREATED).json({ fileAction })
  res.status(StatusCodes.CREATED).json({ msg: 'process started' })
}

const batchUpdateInventory = async (
  squareName,
  squareId,
  vendorLocations,
  fileName,
  fileActionId
) => {
  let dataHeaders
  const inventoryUpdateData = await csv()
    .on('header', (header) => {
      dataHeaders = header
    })
    .fromFile(`./uploads/${fileName}`)

  if (inventoryUpdateData == null) {
    //error
  }

  let inventoryChanges = []
  let resultsJSON = []
  let today = new Date(Date.now())
  let errorMsg = ''

  //array of valid location names:
  let allLocationNames = ALL_LOCATIONS.map((el) => el.name)

  //this is the total number of locations included in the file:
  let headerLocations = dataHeaders.filter((el) =>
    allLocationNames.includes(el)
  )

  productLoop: for (let i = 0; i < inventoryUpdateData.length; i++) {
    let validEl = true
    let currUpdateItem = Object.entries(inventoryUpdateData[i])
    let variationId = currUpdateItem.find((element) => {
      return element[0].toUpperCase() == 'VARIATION ID'
    })

    //check if catalog object exists
    let currProductResponse
    try {
      currProductResponse = await squareClient.catalogApi.retrieveCatalogObject(
        variationId[1],
        true
      )
    } catch (error) {
      resultsJSON.push({
        ...inventoryUpdateData[i],
        status: 'Failed',
        message: 'ID does not match any existing product',
      })
      console.log('ID does not match any existing product')
      continue productLoop
    }

    let relatedItem = currProductResponse.result.relatedObjects.filter((el) => {
      return el.id == currProductResponse.result.object.itemVariationData.itemId
    })

    let itemVendor =
      relatedItem[0].customAttributeValues['vendor_name'].stringValue

    if (itemVendor != squareName) {
      resultsJSON.push({
        ...inventoryUpdateData[i],
        status: 'Failed',
        message: 'Not authorized to edit this product',
      })
      console.log('Not authorized to edit this product')
      continue productLoop
    }

    let invObj = headerLocations.map((el) => {
      let quantity = currUpdateItem.find((element) => {
        return element[0].toUpperCase() == el.toUpperCase()
      })

      //check if quantity is a number
      if (!Number.isInteger(parseInt(quantity[1]))) {
        errorMsg = 'quantity is not a number'
        validEl = false
        return {}
      }

      //don't need to check if location ID exists because headerLocations is already checked against the ALL_LOCATIONS const
      let locationId = ALL_LOCATIONS.find((location) => {
        return location.name.toUpperCase() == el.toUpperCase()
      })

      return {
        type: 'PHYSICAL_COUNT',
        physicalCount: {
          catalogObjectId: variationId[1],
          state: 'IN_STOCK',
          locationId: locationId.id,
          quantity: quantity[1],
          occurredAt: today.toISOString(),
        },
      }
    })

    //populate inventory changes array:
    if (validEl) {
      inventoryChanges.push(invObj)
    }

    //write to results file:
    resultsJSON.push({
      ...inventoryUpdateData[i],
      status: validEl ? 'OK' : 'Failed',
      message: validEl
        ? `Inventory updated successfully for ${headerLocations.length} location(s)`
        : errorMsg,
    })
  }

  try {
    const response = await squareClient.inventoryApi.batchChangeInventory({
      idempotencyKey: nanoid(),
      //idempotencyKey: 'a',
      changes: inventoryChanges.flat(),
    })
  } catch (error) {
    console.log(error.errors[0].code)
    for (let i = 0; i < resultsJSON.length; i++) {
      console.log(resultsJSON[i].status)
      if (resultsJSON[i].status == 'OK') {
        resultsJSON[i].status = 'Failed'
        resultsJSON[i].message = `${error.errors.code}: ${error.errors.detail}`
      }
    }
  } finally {
    //console.log(resultsJSON)
    let headerTitles = Object.keys(resultsJSON[0])
    console.log(headerTitles)
    const csvWriter = createCsvWriter.createArrayCsvWriter({
      path: `./uploads/${fileName.replace('Import-', 'Results-')}`,
      header: headerTitles,
    })
    for (let i = 0; i < resultsJSON.length; i++) {
      let rowValues = [Object.values(resultsJSON[i])]
      console.log(rowValues)
      await csvWriter.writeRecords(rowValues)
    }
  }

  // const csvWriter = createCsvWriter.createObjectCsvWriter({
  //   path: `./uploads/${fileName.replace('Import-', 'Results-')}`,
  //   header: [
  //     { id: 'productName', title: 'productName' },
  //     { id: 'variationName', title: 'variationName' },
  //     { id: 'variationSku', title: 'variationSku' },
  //     { id: 'variationPrice', title: 'variationPrice' },
  //     { id: 'productId', title: 'productId' },
  //     { id: 'variationId', title: 'variationId' },
  //     { id: 'status', title: 'status' },
  //     { id: 'message', title: 'message' },
  //   ],
  // })
}

const batchUpdateProducts = async (
  squareName,
  squareId,
  vendorLocations,
  fileName,
  fileActionId
) => {
  let processedIds = [''],
    organizedProducts = []

  const productUpdateData = await csv().fromFile(`./uploads/${fileName}`)

  if (productUpdateData == null) {
    //error
  }

  for (let i = 0; i < productUpdateData.length; i++) {
    if (productUpdateData[i].productId) {
      //this is an existing product
      if (!processedIds.includes(productUpdateData[i].productId)) {
        processedIds.push(productUpdateData[i].productId)
        let currProduct = productUpdateData.filter((row) => {
          return productUpdateData[i].productId == row.productId
        })
        organizedProducts.push(currProduct)
      }
    } else {
      //this is a new product and product name is not empty
      if (!processedIds.includes(productUpdateData[i].productName)) {
        processedIds.push(productUpdateData[i].productName)
        let currProduct = productUpdateData.filter((row) => {
          return productUpdateData[i].productName == row.productName
        })
        organizedProducts.push(currProduct)
      }
    }
  }

  const csvWriter = createCsvWriter.createObjectCsvWriter({
    path: `./uploads/${fileName.replace('Import-', 'Results-')}`,
    header: [
      { id: 'productName', title: 'productName' },
      { id: 'variationName', title: 'variationName' },
      { id: 'variationSku', title: 'variationSku' },
      { id: 'variationPrice', title: 'variationPrice' },
      { id: 'productId', title: 'productId' },
      { id: 'variationId', title: 'variationId' },
      { id: 'status', title: 'status' },
      { id: 'message', title: 'message' },
    ],
  })

  let resultsJSON = []
  productLoop: for (let i = 0; i < organizedProducts.length; i++) {
    let response = null
    let statusOK = true
    let message = ''

    if (organizedProducts[i][0].productId) {
      //this is an existing product
      let currProductResponse
      try {
        currProductResponse =
          await squareClient.catalogApi.retrieveCatalogObject(
            organizedProducts[i][0].productId,
            false
          )
      } catch (error) {
        for (let j = 0; j < organizedProducts[i].length; j++) {
          resultsJSON.push({
            ...organizedProducts[i][j],
            status: 'Failed',
            message: 'ID does not match any existing product',
          })
        }

        console.log('ID does not match any existing product')
        continue productLoop
      }

      let itemVendor =
        currProductResponse.result.object.customAttributeValues['vendor_name']
          .stringValue

      if (itemVendor != squareName) {
        for (let j = 0; j < organizedProducts[i].length; j++) {
          resultsJSON.push({
            ...organizedProducts[i][j],
            status: 'Failed',
            message: 'Not authorized to edit this product',
          })
        }
        console.log('Not authorized to edit this product')
        continue productLoop
      }

      let currProductObject = currProductResponse.result
      let currProductVariations = currProductObject.object.itemData.variations

      if (organizedProducts[i][0].productName != '') {
        currProductObject.object.itemData.name =
          organizedProducts[i][0].productName
      }

      for (let j = 0; j < organizedProducts[i].length; j++) {
        let price = parseInt(organizedProducts[i][j].variationPrice * 100)
        if (!Number.isInteger(price)) {
          for (let j = 0; j < organizedProducts[i].length; j++) {
            resultsJSON.push({
              ...organizedProducts[i][j],
              status: 'Failed',
              message: 'Price needs to be a number',
            })
          }
          console.log('not an int')
          continue productLoop
        } else {
          organizedProducts[i][j].variationPrice = price
        }

        let variationIndex = currProductVariations.findIndex((variation) => {
          return variation.id == organizedProducts[i][j].variationId
        })
        if (variationIndex >= 0) {
          //variation ID exists, edit the existing one
          currProductVariations[variationIndex].itemVariationData.name =
            organizedProducts[i][j].variationName
          currProductVariations[variationIndex].itemVariationData.sku =
            organizedProducts[i][j].variationSku
          currProductVariations[
            variationIndex
          ].itemVariationData.priceMoney.amount = price
        } else {
          //create a new variation
          let newVariation = {
            type: 'ITEM_VARIATION',
            id: `#product${i}_variation${j}`,
            itemVariationData: {
              itemId: organizedProducts[i][j].productId,
              name: organizedProducts[i][j].variationName,
              sku: organizedProducts[i][j].variationSku || '',
              pricingType: 'FIXED_PRICING',
              priceMoney: {
                amount: organizedProducts[i][j].variationPrice || 0,
                currency: 'CAD',
              },
              trackInventory: true,
              availableForBooking: false,
              stockable: true,
            },
          }

          organizedProducts[i][j].variationId = `#product${i}_variation${j}`
          currProductVariations.push(newVariation)
        }

        currProductObject.object.itemData.variations = currProductVariations
      }

      //upsert the entire object
      try {
        response = await squareClient.catalogApi.upsertCatalogObject({
          idempotencyKey: nanoid(),
          object: currProductObject.object,
        })
        //console.log(response.result)
      } catch (error) {
        for (let j = 0; j < organizedProducts[i].length; j++) {
          resultsJSON.push({
            ...organizedProducts[i][j],
            status: 'Failed',
            message: 'Error calling Square API',
          })
        }
        console.log(error)
        continue productLoop
      }

      //everything above this line is for existing products
    } else {
      //this is an entirely new product

      for (let j = 0; j < organizedProducts[i].length; j++) {
        let price = parseInt(organizedProducts[i][j].variationPrice * 100)
        if (!Number.isInteger(price)) {
          for (let j = 0; j < organizedProducts[i].length; j++) {
            resultsJSON.push({
              ...organizedProducts[i][j],
              status: 'Failed',
              message: 'Price needs to be a number',
            })
          }
          console.log('not an int')
          continue productLoop
        } else {
          organizedProducts[i][j].variationPrice = price
        }
        organizedProducts[i][j].productId = `#new_product${i}`
        organizedProducts[i][j].variationId = `#product${i}_variation${j}`
      }

      let newProductVariations = organizedProducts[i].map(
        (variation, index) => ({
          type: 'ITEM_VARIATION',
          id: `#product${i}_variation${index}`,
          itemVariationData: {
            itemId: `#new_product${i}`,
            name: variation.variationName || variation.productName,
            sku: variation.variationSku || '',
            pricingType: 'FIXED_PRICING',
            priceMoney: {
              amount: variation.variationPrice || 0,
              currency: 'CAD',
            },
            trackInventory: true,
            availableForBooking: false,
            stockable: true,
          },
        })
      )

      let newProductObject = {
        type: 'ITEM',
        id: `#new_product${i}`,
        customAttributeValues: {
          vendor_name: {
            stringValue: squareName,
          },
        },
        itemData: {
          name: organizedProducts[i][0].productName,
          variations: newProductVariations,
          categoryId: squareId,
        },
      }

      try {
        response = await squareClient.catalogApi.upsertCatalogObject({
          idempotencyKey: nanoid(),
          object: newProductObject,
        })
        console.log(response.result)
      } catch (error) {
        for (let j = 0; j < organizedProducts[i].length; j++) {
          resultsJSON.push({
            ...organizedProducts[i][j],
            status: 'Failed',
            message: 'Error calling Square API',
          })
        }
        console.log(error)
        continue productLoop
      }
    }

    if (response?.result?.idMappings) {
      let today = new Date(Date.now())

      //save the new product ID:
      let newProductIdEl = response.result.idMappings.find((el) => {
        return el.clientObjectId.includes('#new_product')
      })
      if (newProductIdEl) {
        for (let j = 0; j < organizedProducts[i].length; j++) {
          organizedProducts[i][j].productId = newProductIdEl.objectId
        }
      }

      //save the new variation IDs:
      const mappableOrganizedProducts = organizedProducts.flat()

      console.log('mappable', mappableOrganizedProducts)
      console.log('id mappings', response.result.idMappings)

      for (let j = 0; j < response.result.idMappings.length; j++) {
        if (
          response.result.idMappings[j].clientObjectId.includes('variation')
        ) {
          let newItemIndex = mappableOrganizedProducts.findIndex((el) => {
            return (
              el.variationId == response.result.idMappings[j].clientObjectId
            )
          })
          mappableOrganizedProducts[newItemIndex].variationId =
            response.result.idMappings[j].objectId
          console.log(newItemIndex)
        }
      }

      // get the new variation IDs to initialize inventory to 0
      let newVariationIds = response.result.idMappings.filter((el) => {
        var originalId = el.clientObjectId
        return originalId.includes('variation')
      })

      let inventoryChanges = newVariationIds
        .map((el) => {
          var locationCountObj = vendorLocations.map((location) => {
            return {
              type: 'PHYSICAL_COUNT',
              physicalCount: {
                catalogObjectId: el.objectId,
                state: 'IN_STOCK',
                locationId: location,
                quantity: '0',
                occurredAt: today.toISOString(),
              },
            }
          })

          return locationCountObj
        })
        .flat()

      try {
        const inventoryResponse =
          await squareClient.inventoryApi.batchChangeInventory({
            idempotencyKey: nanoid(),
            changes: inventoryChanges,
          })
      } catch (error) {
        for (let j = 0; j < organizedProducts[i].length; j++) {
          resultsJSON.push({
            ...organizedProducts[i][j],
            status: 'OK',
            message:
              'Product created, but error initializing inventory for new products',
          })
        }
        console.log(error)
        continue productLoop
      }
    }

    for (let j = 0; j < organizedProducts[i].length; j++) {
      resultsJSON.push({
        ...organizedProducts[i][j],
        status: 'OK',
        message: 'Item successfully created.',
      })
    }
  }

  console.log(resultsJSON)

  for (let i = 0; i < resultsJSON.length; i++) {
    await csvWriter.writeRecords([
      {
        productName: resultsJSON[i].productName,
        variationName: resultsJSON[i].variationName,
        variationSku: resultsJSON[i].variationSku,
        variationPrice: resultsJSON[i].variationPrice,
        productId: resultsJSON[i].productId,
        variationId: resultsJSON[i].variationId,
        status: resultsJSON[i].status,
        message: resultsJSON[i].message,
      },
    ])
  }
}

export const startFileAction = async (req, res) => {
  //if status is already running, do nothing and exit

  const fileActionInfo = await Job.findById(req.params.id)

  //else:
  const fileAction = await FileAction.findByIdAndUpdate(
    req.params.id,
    {
      status: FILE_UPLOAD_STATUS.RUNNING,
    },
    {
      new: true,
    }
  )

  //console.log(req.user)
  // batchUpdateProducts(
  //   req.user.squareName,
  //   req.user.squareId,
  //   req.user.locations
  // )
  res.status(StatusCodes.OK).json({ fileAction: fileAction })
}
