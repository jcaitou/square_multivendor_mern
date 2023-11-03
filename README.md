# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

# Need to add:

Order history & money earned

User (Vendor) model:
-multiple locations
-how to register a new vendor?
-disabled mode (can only view products/orders, cannot edit)

Store model (?):
-active locations
-payments to vendors

Export: option to export page only, or all items (by email)

Discount function: opt-in for vendors

Barcode generation

Report bug feature

Low in stock warning

Agenda needs to be set up for certain functions:
-(?) order webhook

unused packages:

Added front end function:
-sort inventory page by a-z or count
-Export all inventory
-Export all products
-Display all file actions
-update password
-create user (admin function)

Front end development (back end already done):
-Display all orders with amount earned during that time period
-query orders by product (sales by product to see which performs best)

Things to fix:
-product prices - should i return the values as price / 100 already?

Front and back end dev:
-Display details about one order (do I really need this?)

administrative functions
Adding new user:
-only doable with 'admin' role

When setting up from scratch:

1. Create custom attribute in Square
2. Add locations in square and get the location IDs (maybe change this into a function)
3. Create first account (User with administrator role)
