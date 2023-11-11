import ProductSelectionWrapper from '../assets/wrappers/ProductSelectionTable'
import { Fragment } from 'react'
import Button from 'react-bootstrap/Button'
import Modal from 'react-bootstrap/Modal'
import Table from 'react-bootstrap/Table'
import InfiniteScroll from 'react-infinite-scroll-component'
import customFetch from '../utils/customFetch'
import { useDashboardContext } from '../pages/DashboardLayout'

function ProductSelectionModal({
  loadedProducts,
  setLoadedProducts,
  cursor,
  setCursor,
  selectedProducts,
  selectProducts,
  ...props
}) {
  const { user } = useDashboardContext()
  const CADMoney = new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency: 'CAD',
  })

  const productSearch = (e) => {
    const searchQuery = e.target.value.toLowerCase()
    const allRows = document.querySelectorAll(
      '#product-selection-table tbody tr'
    )
    allRows.forEach((row) => {
      if (row.dataset.product.toLowerCase().includes(searchQuery)) {
        row.style.display = 'table-row'
      } else {
        row.style.display = 'none'
      }
    })
  }

  console.log(loadedProducts)
  console.log(user)

  return (
    <Modal
      {...props}
      size='lg'
      aria-labelledby='contained-modal-title-vcenter'
      centered
    >
      <ProductSelectionWrapper>
        <Modal.Header closeButton>
          <Modal.Title id='contained-modal-title-vcenter'>
            Select Products
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <input
            type='search'
            name='search'
            onChange={(e) => productSearch(e)}
          />
          <div className='product-selection-table' id='product-selection-table'>
            {user.role === 'user' ? (
              <InfiniteScroll
                dataLength={loadedProducts?.length || 0}
                next={async () => {
                  const { data } = await customFetch.get(
                    `/products?cursor=${cursor}`
                  )
                  setLoadedProducts(loadedProducts.concat(data.items))
                  setCursor(data.cursor)
                  return
                }}
                hasMore={cursor != ''}
                scrollableTarget='product-selection-table'
                loader={<h4>Loading...</h4>}
              >
                <Table striped bordered hover>
                  <thead>
                    <tr>
                      <th>
                        <input
                          type='checkbox'
                          name='all-products'
                          id='all-products'
                          value='all-products'
                          onChange={(e) => {
                            let allCheckboxes = document.querySelectorAll(
                              '#product-selection-table input[type="checkbox"][name="product-selection"]'
                            )
                            allCheckboxes.forEach((checkbox) => {
                              checkbox.checked = e.target.checked
                            })
                          }}
                        />
                      </th>
                      <th>Name</th>
                      <th>SKU</th>
                      <th>Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loadedProducts &&
                      loadedProducts.map((product) => {
                        let priceMin, priceMax
                        if (product.itemData.variations.length != 1) {
                          priceMin = product.itemData.variations.reduce(
                            function (prev, curr) {
                              return prev.itemVariationData.priceMoney.amount <
                                curr.itemVariationData.priceMoney.amount
                                ? prev
                                : curr
                            }
                          )
                          priceMax = product.itemData.variations.reduce(
                            function (prev, curr) {
                              return prev.itemVariationData.priceMoney.amount <
                                curr.itemVariationData.priceMoney.amount
                                ? curr
                                : prev
                            }
                          )
                        }
                        return (
                          <Fragment key={product.id}>
                            <tr data-product={product.itemData.name}>
                              <td>
                                <input
                                  type='checkbox'
                                  name='product-selection'
                                  id={product.id}
                                  value={product.id}
                                  defaultChecked={selectedProducts.includes(
                                    product.id
                                  )}
                                />
                              </td>
                              <td className='has-label'>
                                <label htmlFor={product.id}>
                                  {product.itemData.name}
                                </label>
                              </td>
                              <td className='has-label'>
                                <label htmlFor={product.id}>
                                  {product.itemData.variations.length == 1
                                    ? product.itemData.variations[0]
                                        .itemVariationData.sku
                                    : `${product.itemData.variations.length} variations`}
                                </label>
                              </td>
                              <td className='has-label'>
                                <label htmlFor={product.id}>
                                  {product.itemData.variations.length == 1
                                    ? CADMoney.format(
                                        product.itemData.variations[0]
                                          .itemVariationData.priceMoney.amount /
                                          100
                                      )
                                    : `${CADMoney.format(
                                        priceMin.itemVariationData.priceMoney
                                          .amount / 100
                                      )} - ${CADMoney.format(
                                        priceMax.itemVariationData.priceMoney
                                          .amount / 100
                                      )}`}
                                </label>
                              </td>
                            </tr>
                          </Fragment>
                        )
                      })}
                  </tbody>
                </Table>
              </InfiniteScroll>
            ) : (
              <Table striped bordered hover>
                <thead>
                  <tr>
                    <th>
                      <input
                        type='checkbox'
                        name='all-products'
                        id='all-products'
                        value='all-products'
                        onChange={(e) => {
                          let allCheckboxes = document.querySelectorAll(
                            '#product-selection-table input[type="checkbox"][name="product-selection"]'
                          )
                          allCheckboxes.forEach((checkbox) => {
                            checkbox.checked = e.target.checked
                          })
                        }}
                      />
                    </th>
                    <th>Name</th>
                  </tr>
                </thead>
                <tbody>
                  {loadedProducts &&
                    loadedProducts.map((category) => {
                      return (
                        <Fragment key={category._id}>
                          <tr data-product={category.name}>
                            <td>
                              <input
                                type='checkbox'
                                name='product-selection'
                                id={category.squareId}
                                value={category.squareId}
                                defaultChecked={
                                  selectedProducts.includes(
                                    category.squareId
                                  ) || category.squareId === user.squareId
                                }
                                disabled={category.squareId === user.squareId}
                              />
                            </td>
                            <td className='has-label'>
                              <label htmlFor={category.squareId}>
                                {category.name}
                              </label>
                            </td>
                          </tr>
                        </Fragment>
                      )
                    })}
                </tbody>
              </Table>
            )}
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={selectProducts}>Done</Button>
        </Modal.Footer>
      </ProductSelectionWrapper>
    </Modal>
  )
}

export default ProductSelectionModal
