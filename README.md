# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

# Need to add:

Batch product action:
-create new product and edit existing products work
-inventory is set to 0 if new variations are added
-need to add checks: what if price is not a number
-what if ids are provided but do not match anything?

-need to add results file
-more testing

Products:
-add product photo

Inventory locations:
-based on vendors' active locations
-edit individual product inventory
-batch edit product inventory (aka restock)

Able to display all inventory counts
export
import
initialize all created products with 0 inventory

Product discounts:
-add discount rules

Order history & money earned

User (Vendor) model:
-multiple locations
-how to register a new vendor?
-disabled mode (can only view products/orders, cannot edit)

Store model (?):
-active locations
-payments to vendors

NEXT: WORK ON IMPORT (both inventory and products)
-connect it to the mongo import object

unused packages:
primereact
