import Product from './Product'
import StateBar from './StateBar'
import Wrapper from '../assets/wrappers/ProductsContainer'
import { Link, useNavigate } from 'react-router-dom'
import { useAllProductsContext } from '../pages/AllProducts'
import { useState } from 'react'
import { toast } from 'react-toastify'
import customFetch from '../utils/customFetch'
import { CSVLink } from 'react-csv'
import Button from 'react-bootstrap/Button'
import Modal from 'react-bootstrap/Modal'
import PageBtnContainer from './CursorPageBtnContainer'

const ProductsContainer = () => {
  const { data } = useAllProductsContext()
  const products = data?.items || []
  const cursor = data?.cursor
  const today = new Date()
  const dateString = `${today.getFullYear()}${today.getMonth() + 1}${
    today.getDate() + 1
  }`
  const navigate = useNavigate()
  //export helpers:
  const [exportProductsModalShow, setExportProductsModalShow] = useState(false)
  //import helpers:
  const [importFile, setImportFile] = useState(null)
  const [importProductsModalShow, setImportProductsModalShow] = useState(false)
  //single delete helpers:
  const [confirmSingleDeleteModalShow, setConfirmSingleDeleteModalShow] =
    useState(false)
  const [singleIdToDelete, setSingleIdToDelete] = useState(null)
  //batch delete helpers:
  const [idsToDelete, setIdsToDelete] = useState([])
  const [deleteMode, setDeleteMode] = useState(false)
  const [confirmDeleteModalShow, setConfirmDeleteModalShow] = useState(false)
  const [selectMoreProductsShow, setSelectMoreProductsShow] = useState(false)

  const variationsData = products
    .map((product) => {
      return product.itemData.variations.map((variation) => {
        return {
          productName: product.itemData.name,
          variationName: variation.itemVariationData.name,
          variationSku: variation.itemVariationData.sku,
          variationPrice: variation.itemVariationData.priceMoney.amount,
          productId: variation.itemVariationData.itemId.toString(),
          variationId: variation.id.toString(),
        }
      })
    })
    .flat()

  const handleItemDelSelect = (event) => {
    var newIdsToDelete = [...idsToDelete]
    if (event.target.checked) {
      newIdsToDelete.push(event.target.value)
    } else {
      newIdsToDelete = idsToDelete.filter(
        (value) => value != event.target.value
      )
    }
    setIdsToDelete(newIdsToDelete)
  }

  const handleFileImport = (e) => {
    setImportFile(e.target.files[0])
  }

  const handleImportSubmit = async (e) => {
    e.preventDefault()

    let data = new FormData()
    data.append('type', 'product')
    data.append('update-file', importFile)

    try {
      let response = await customFetch.post('/uploads', data)
      console.log(response.data)
      toast.success('Batch update has started')
      setImportProductsModalShow(false)
      setImportFile(null)
      navigate('/dashboard/all-products', { replace: true })
    } catch (error) {
      console.log(error)
      toast.error(error?.response?.data?.msg)
    }
  }

  //single product delete
  const confirmSingleDeleteProducts = (productId) => {
    setSingleIdToDelete(productId)
    setConfirmSingleDeleteModalShow(true)
  }

  const handleSingleDeleteProduct = async () => {
    if (singleIdToDelete) {
      console.log('single delete product')
      setConfirmSingleDeleteModalShow(false)
      try {
        let response = await customFetch.delete(`/products/${singleIdToDelete}`)
        toast.success('Product deleted successfully')
        setSingleIdToDelete(null)
        navigate('/dashboard/all-products', { replace: true })
      } catch (error) {
        console.log(error)
        toast.error(error?.response?.data?.msg)
      }
    }
  }

  //batch delete
  const startBatchDeleteProducts = (e) => {
    setDeleteMode(true)
  }

  const discardBatchDeleteProdcuts = () => {
    setDeleteMode(false)
    setIdsToDelete([])
  }

  const confirmDeleteProducts = () => {
    if (idsToDelete.length > 0) {
      setConfirmDeleteModalShow(true)
    } else {
      setSelectMoreProductsShow(true)
    }
  }

  const handleBatchDeleteProducts = async (e) => {
    e.preventDefault()
    console.log('start delete process')

    if (idsToDelete.length > 0) {
      const productData = {
        idsToDelete: idsToDelete,
      }

      try {
        let response = await customFetch.post(
          '/products/batch-delete',
          productData
        )
        toast.success('Products deleted successfully')
        setConfirmDeleteModalShow(false)
        setIdsToDelete([])
        setDeleteMode(false)
        navigate('/dashboard/all-products', { replace: true })
      } catch (error) {
        console.log(error)
        toast.error(error?.response?.data?.msg)
      }
    }
  }

  return (
    <>
      <StateBar
        showStateBar={deleteMode}
        discardAction={discardBatchDeleteProdcuts}
        submitAction={confirmDeleteProducts}
        submitText='Delete All'
      ></StateBar>
      <Wrapper>
        <div className='product-actions'>
          <div className='grouped-actions'>
            {products.length > 0 && (
              <button
                className='btn'
                onClick={() => setExportProductsModalShow(true)}
              >
                Export Products
              </button>
            )}
            {/* <CSVLink
              data={variationsData}
              filename={`products-export-${dateString}.csv`}
              className='btn'
            >
              Export Products(old)
            </CSVLink> */}
            <button
              className='btn'
              onClick={() => setImportProductsModalShow(true)}
            >
              Import Products
            </button>
          </div>

          <div className='grouped-actions'>
            {products.length > 0 && (
              <button
                type='submit'
                className='btn delete-btn'
                onClick={
                  deleteMode ? confirmDeleteProducts : startBatchDeleteProducts
                }
              >
                {deleteMode ? 'Delete All' : 'Batch Delete Products'}
              </button>
            )}
            <Link to={'../add-product'} className='btn'>
              Add Product
            </Link>
          </div>
        </div>
        {products.length === 0 && <h2>No products to display...</h2>}
        <div className='products'>
          {products.map((product) => {
            return (
              <Product
                key={product.id}
                product={product}
                handleItemDelSelect={handleItemDelSelect}
                confirmSingleDeleteProducts={() =>
                  confirmSingleDeleteProducts(product.id)
                }
                deleteMode={deleteMode}
              />
            )
          })}
        </div>
        {products.length > 0 && <PageBtnContainer cursor={cursor} />}
      </Wrapper>
      <ImportProductsModal
        handleFileImport={handleFileImport}
        handleImportSubmit={handleImportSubmit}
        importFile={importFile}
        show={importProductsModalShow}
        onHide={() => {
          setImportProductsModalShow(false)
          setImportFile(null)
        }}
      />
      <ExportProductsModal
        show={exportProductsModalShow}
        variationsData={variationsData}
        dateString={dateString}
        onHide={() => setExportProductsModalShow(false)}
      />
      <ConfirmBatchDeleteModal
        handleBatchDeleteProducts={handleBatchDeleteProducts}
        show={confirmDeleteModalShow}
        onHide={() => setConfirmDeleteModalShow(false)}
      />
      <ConfirmSingleDeleteModal
        handleSingleDeleteProduct={handleSingleDeleteProduct}
        show={confirmSingleDeleteModalShow}
        onHide={() => setConfirmSingleDeleteModalShow(false)}
      />
      <SelectMoreItemsError
        show={selectMoreProductsShow}
        onHide={() => setSelectMoreProductsShow(false)}
      />
    </>
  )
}

function SelectMoreItemsError(props) {
  return (
    <Modal
      {...props}
      size='lg'
      aria-labelledby='contained-modal-title-vcenter'
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title id='contained-modal-title-vcenter'>
          No Products Selected
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>Select at least one product to batch delete!</p>
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={props.onHide}>OK</Button>
      </Modal.Footer>
    </Modal>
  )
}

function ConfirmSingleDeleteModal({ handleSingleDeleteProduct, ...props }) {
  return (
    <Modal
      {...props}
      size='lg'
      aria-labelledby='contained-modal-title-vcenter'
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title id='contained-modal-title-vcenter'>
          Delete Product
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>Are you sure you want to delete the selected product?</p>
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={props.onHide}>No</Button>
        <Button onClick={handleSingleDeleteProduct}>Yes</Button>
      </Modal.Footer>
    </Modal>
  )
}

function ConfirmBatchDeleteModal({ handleBatchDeleteProducts, ...props }) {
  return (
    <Modal
      {...props}
      size='lg'
      aria-labelledby='contained-modal-title-vcenter'
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title id='contained-modal-title-vcenter'>
          Delete Products
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>Are you sure you want to delete the selected products?</p>
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={props.onHide}>No</Button>
        <Button onClick={handleBatchDeleteProducts}>Yes</Button>
      </Modal.Footer>
    </Modal>
  )
}
function ImportProductsModal({
  handleImportSubmit,
  handleFileImport,
  importFile,
  ...props
}) {
  return (
    <Modal
      {...props}
      size='lg'
      aria-labelledby='contained-modal-title-vcenter'
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title id='contained-modal-title-vcenter'>
          Import Products by CSV
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>
          Download a <span>sample CSV template</span> to see how you should
          format your data.
        </p>
        <form>
          <input type={'file'} accept={'.csv'} onChange={handleFileImport} />
        </form>
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={props.onHide}>Cancel</Button>
        <Button onClick={handleImportSubmit} disabled={importFile == null}>
          Import CSV
        </Button>
      </Modal.Footer>
    </Modal>
  )
}

function ExportProductsModal({ variationsData, dateString, ...props }) {
  const [exportPage, setExportPage] = useState(true)
  const [actionSubmitted, setActionSubmitted] = useState(false)
  const handleExportTypeChange = (e) => {
    const value = e.target.value
    if (value === 'page') {
      setExportPage(true)
    } else {
      setExportPage(false)
    }
  }
  const handleExportSubmit = async (e) => {
    e.preventDefault()
    try {
      await customFetch.get('/exports/export-all-products')
      toast.success('Full product export will be sent to your email')
      setActionSubmitted(true)
    } catch (error) {
      toast.error(error?.response?.data?.msg)
      return error
    }
  }

  return (
    <Modal
      {...props}
      size='lg'
      aria-labelledby='contained-modal-title-vcenter'
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title id='contained-modal-title-vcenter'>
          Export Product List by CSV
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {actionSubmitted ? (
          <p>Your export has started</p>
        ) : (
          <>
            <p>Choose your export option:</p>
            <input
              type='radio'
              id='page'
              name='export-option'
              value='page'
              checked={exportPage}
              onChange={(e) => handleExportTypeChange(e)}
            />
            <label htmlFor='page'>
              Export the products in the current view
            </label>
            <input
              type='radio'
              id='full'
              name='export-option'
              value='full'
              checked={!exportPage}
              onChange={(e) => handleExportTypeChange(e)}
            />
            <label htmlFor='full'>Full export (to email)</label>
          </>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={props.onHide}>Cancel</Button>
        {exportPage ? (
          <CSVLink
            data={variationsData}
            filename={`products-export-${dateString}.csv`}
            onClick={() => {
              setActionSubmitted(true)
            }}
            className='btn'
          >
            Export CSV
          </CSVLink>
        ) : (
          <button className='btn' onClick={handleExportSubmit}>
            Export CSV
          </button>
        )}
      </Modal.Footer>
    </Modal>
  )
}

export default ProductsContainer
