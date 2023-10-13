import Product from './Product'
import StateBar from './StateBar'
import Wrapper from '../assets/wrappers/ProductsContainer'
import { Form, useNavigate } from 'react-router-dom'
import { useAllProductsContext } from '../pages/AllProducts'
import { useState } from 'react'
import { toast } from 'react-toastify'
import customFetch from '../utils/customFetch'
import { CSVLink } from 'react-csv'
import Papa from 'papaparse'
import Button from 'react-bootstrap/Button'
import Modal from 'react-bootstrap/Modal'

const ProductsContainer = () => {
  const { data: products } = useAllProductsContext()
  const navigate = useNavigate()
  //import helpers:
  const [importData, setImportData] = useState(null)
  const [importProductsModalShow, setImportProductsModalShow] = useState(false)
  const [fileUploaded, setFileUploaded] = useState(false)
  //single delete helpers:
  const [confirmSingleDeleteModalShow, setConfirmSingleDeleteModalShow] =
    useState(false)
  const [singleIdToDelete, setSingleIdToDelete] = useState(null)
  //batch delete helpers:
  const [idsToDelete, setIdsToDelete] = useState([])
  const [deleteMode, setDeleteMode] = useState(false)
  const [confirmDeleteModalShow, setConfirmDeleteModalShow] = useState(false)
  const [selectMoreProductsShow, setSelectMoreProductsShow] = useState(false)

  if (products.length === 0) {
    return (
      <Wrapper>
        <h2>No products to display...</h2>
      </Wrapper>
    )
  }

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
    const file = e.target.files[0]
    if (file) {
      Papa.parse(file, {
        header: true,
        complete: function (results) {
          setImportData(results.data)
          setFileUploaded(true)
        },
      })
    }
  }

  const handleImportSubmit = async (e) => {
    e.preventDefault()

    try {
      let response = await customFetch.post(
        '/products/batch-update',
        importData
      )
      console.log(response.data)
      //toast.success('Products deleted successfully')

      //navigate('/dashboard/all-products')
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
    setConfirmDeleteModalShow(false)

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
        setIdsToDelete([])
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
          <div className='import-export-actions'>
            <CSVLink data={variationsData} className='btn'>
              Export Products
            </CSVLink>
            <button
              className='btn'
              onClick={() => setImportProductsModalShow(true)}
            >
              Import Products
            </button>
          </div>

          <button
            type='submit'
            className='btn delete-btn'
            onClick={
              deleteMode ? confirmDeleteProducts : startBatchDeleteProducts
            }
          >
            {deleteMode ? 'Delete All' : 'Batch Delete Prodcuts'}
          </button>
        </div>
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
      </Wrapper>
      <ImportProductsModal
        handleFileImport={handleFileImport}
        handleImportSubmit={handleImportSubmit}
        fileUploaded={fileUploaded}
        show={importProductsModalShow}
        onHide={() => setImportProductsModalShow(false)}
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
  fileUploaded,
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
        <Button onClick={handleImportSubmit} disabled={!fileUploaded}>
          Import CSV
        </Button>
      </Modal.Footer>
    </Modal>
  )
}

export default ProductsContainer
