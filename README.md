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

Report bug feature

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
-Display all orders with amount earned during that time period
-Discount function: opt-in for vendors
-Low in stock warning
-both frontend and backend for stats page
-export orders
Added email hook:
-when item hits low stock warning/out of stock

React Query\*\*\*\*

Functions:
-export all barcodes as zip file (?)

Email hooks:
-when storewide discount is created
-monthly reports: sales summary, expected revnue

User settings:
-default inventory warning level (eg. 3)
-default discount opt-in?
-choose whether or not to receive inventory warnings

Static page content:
-how to import products
-how to import inventory

Next clean refresh:
-orders export: select inputs should start from when the user is created

administrative functions
Adding new user:
-only doable with 'admin' role
Adding first admin user: the first user also need a Square category (for discounts), can leave the product list empty
-Creating storewide discounts via admin user: add auto email?

When setting up from scratch:

1. Create custom attribute in Square for "vendor_name"
2. Add locations in square and get the location IDs (maybe change this into a function)
3. Create first account (User with administrator role, needs to have locations array and square ID)
