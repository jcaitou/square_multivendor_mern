# Need to add:

Store model (?):
-active locations
-payments to vendors

Report bug feature

# Email hooks:

-monthly reports: sales summary, expected revnue

# Static page content:

-how to import products
-how to import inventory

# When setting up from scratch:

1. Create custom attribute in Square for "vendor_name"

```js
try {
  const response = await client.catalogApi.upsertCatalogObject({
    idempotencyKey: 'eedf7c30-5764-44a5-8b55-9d7617347bef',
    object: {
      type: 'CUSTOM_ATTRIBUTE_DEFINITION',
      id: '#new',
      customAttributeDefinitionData: {
        type: 'STRING',
        name: 'Vendor',
        allowedObjectTypes: ['ITEM', 'ITEM_VARIATION'],
        key: 'vendor_name',
      },
    },
  })

  console.log(response.result)
} catch (error) {
  console.log(error)
}
```

2. Manually add first category named '[Administrator]' and get the Square Catalog ID for that category

3. Create the first administrator account via register specific endpoint: /auth/register-specific

```js
{
    "name": "Administrator",
    "password": "secret123",
    "squareId": "FXUFXSTPGHNTPEUW6O5GLCBQ", //to be set after the category ID is obtained in Square
    "skuId": 0,
    "email": "jtkchoi@gmail.com", //use our company email in the future
    "role": "admin"
}
```

4. Disable the register specific endpoint. **IMPORTANT** It will basically be never used again.

5. Add locations via the create location endpoint: /locations/create-location
   The adminstrator account should automatically have the locations added upon location creation.

At this point, all future accounts can be added via normal operations (below)

# Adding vendor accounts:

1. Login with admin account and register via endpoint: /auth/register

```js
{
    "name": "Cards",
    "email": "asdf@gmail.com",
    "role": "user"
}
```

Front-end will be added soon.
At this point, the vendor is able to login and has full control within the multivendor platform.
However, their items are not available at any of the Square locations yet (ie. you will not be able to see their items in the POS terminal).

2. On the actual contract start date (determined by when they move in):
   Assign locations to the vendor via endpoint: /locations/assign-vendor-location

```js
{
    "userId": "65548261e33a4afb1edd1183",
    "locationId": "LT70Y6CNYBA67"
}
```

Front-end will be added soon.
Once the location is assigned, their products will show up in the Square POS Terminal.

3. During their contract period:
   Vendor decides to rent another location: /locations/assign-vendor-location
   Vendor decides to leave a location: /locations/remove-vendor-location

4. Vendor leaves all of our locations and is no longer selling:
   Deactivate their account via: /users/activation

```js
{
    "userId": "65548261e33a4afb1edd1183",
    "makeActive": false
}
```

Front-end will be added soon.
Vendor will still be able to login and export data (sales history, products, etc) but no longer has the right to add/edit products/discounts/inventory.

# Changed from sandbox to production:

.env access keys for MONGO_URL and SQUARE_ACCESS_TOKEN
squareUtils.js changed environment to Environment.Production

disable mailtrap and enable sending from domain (need to edit all email addresses)
changed endpoint of all webhooks in square

right now I am using the Square built-in function to initialize inventory counts when new products OR new inventory locations are added (https://squareup.com/help/ca/en/article/7746-tracking-your-inventory-with-square-for-retail?utm_medium=web&utm_source=dashboard
be careful that if something breaks in the future, I may have to add the functionality back)

when I add a location, do I always need to add it to admin accounts?

# functions that are written but no front end yet:

locationController.js
createLocation, assignLocation, removeLocation

# next functions to write:

-disable vendor: make vendor unable to add products, edit products, import products, add discounts, edit discounts
-refactor ALL squareClient to try..catch block with the error handler

```js
let response
try {
  response = await squareClient.catalogApi.upsertCatalogObject({
    idempotencyKey: nanoid(),
    object: {
      type: 'CATEGORY',
      id: '#new',
      categoryData: {
        name: req.body.name,
      },
    },
  })
} catch (error) {
  throw new SquareApiError(
    error?.errors[0].detail || 'error while creating category'
  )
}
```

# UNUSED FUNCTIONS:

startFileAction (uploadController.js) - was previously used to start specific import tasks
updateUserLocations (userController.js) - replaced with the locationController.js file

# ONLY FOR OPEN BETA - GENERATING TEST ORDERS

Front-end:
client/src/App.jsx - test-orders route
client/src/utils/links.jsx - test-orders link
client/src/pages/GenerateTestOrders.jsx
Back-end:
server.js

```js
//only for use while testing:
import testOrdersRouter from './routers/testOrdersRouter.js'
app.use('/api/v1/generate-orders', testOrdersRouter)
//delete above later
```

/routers/testOrdersRouter.js
/utils/generateTestOrders.js
