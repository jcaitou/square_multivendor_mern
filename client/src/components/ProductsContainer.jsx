import Wrapper from '../assets/wrappers/ProductsContainer'
import { Link, useNavigate } from 'react-router-dom'
import { useAllProductsContext } from '../pages/AllProducts'
import { useState } from 'react'
import { toast } from 'react-toastify'
import customFetch from '../utils/customFetch'

import Button from 'react-bootstrap/Button'
import Modal from 'react-bootstrap/Modal'
import PageBtnContainer from './CursorPageBtnContainer'
import {
  Product,
  StateBar,
  ModalExportBarcode,
  ModalExportProducts,
  ModalImportProducts,
} from '.'

const ProductsContainer = ({ queryClient }) => {
  const { data } = useAllProductsContext()
  const products = data?.items || []
  const cursor = data?.cursor
  const today = new Date()
  const dateString = `${today.getFullYear()}${today.getMonth() + 1}${
    today.getDate() + 1
  }`
  const navigate = useNavigate()
  //loading helper:
  const [loading, setLoading] = useState(false)
  //export helpers:
  const [exportProductsModalShow, setExportProductsModalShow] = useState(false)
  const [exportBarcodesModalShow, setExportBarcodesModalShow] = useState(false)
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
          variationSku: variation.itemVariationData.sku.slice(5),
          variationPrice: variation.itemVariationData.priceMoney.amount / 100.0,
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
      setLoading(true)
      let response = await customFetch.post('/uploads', data)
      queryClient.invalidateQueries(['fileactions'])
      toast.success('Batch update has started')
      setImportProductsModalShow(false)
      setImportFile(null)
      setLoading(false)
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
      setConfirmSingleDeleteModalShow(false)
      try {
        setLoading(true)
        let response = await customFetch.delete(`/products/${singleIdToDelete}`)
        queryClient.invalidateQueries(['products'])
        queryClient.invalidateQueries(['inventory'])
        setLoading(false)
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

    if (idsToDelete.length > 0) {
      const productData = {
        idsToDelete: idsToDelete,
      }

      try {
        setLoading(true)
        let response = await customFetch.post(
          '/products/batch-delete',
          productData
        )
        queryClient.invalidateQueries(['products'])
        queryClient.invalidateQueries(['inventory'])
        setLoading(false)
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
        loading={loading}
        discardAction={discardBatchDeleteProdcuts}
        submitAction={confirmDeleteProducts}
        submitText='Delete All'
      ></StateBar>
      <Wrapper>
        <div className='product-actions'>
          <div className='grouped-actions'>
            <Link to={'../add-product'} className='btn'>
              Add Product
            </Link>
            <button
              className='btn'
              onClick={() => setImportProductsModalShow(true)}
            >
              Import Products
            </button>
            {products.length > 0 && (
              <button
                className='btn'
                onClick={() => setExportProductsModalShow(true)}
              >
                Export Products
              </button>
            )}
            {products.length > 0 && (
              <button
                className='btn'
                onClick={() => setExportBarcodesModalShow(true)}
              >
                Export Barcodes
              </button>
            )}
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
      <ModalImportProducts
        loading={loading}
        handleFileImport={handleFileImport}
        handleImportSubmit={handleImportSubmit}
        importFile={importFile}
        show={importProductsModalShow}
        onHide={() => {
          setImportProductsModalShow(false)
          setImportFile(null)
        }}
      />
      <ModalExportProducts
        show={exportProductsModalShow}
        variationsData={variationsData}
        dateString={dateString}
        onHide={() => setExportProductsModalShow(false)}
      />
      <ModalExportBarcode
        show={exportBarcodesModalShow}
        onHide={() => setExportBarcodesModalShow(false)}
      />
      <ConfirmBatchDeleteModal
        handleBatchDeleteProducts={handleBatchDeleteProducts}
        loading={loading}
        show={confirmDeleteModalShow}
        onHide={() => setConfirmDeleteModalShow(false)}
      />
      <ConfirmSingleDeleteModal
        handleSingleDeleteProduct={handleSingleDeleteProduct}
        show={confirmSingleDeleteModalShow}
        loading={loading}
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

function ConfirmSingleDeleteModal({
  handleSingleDeleteProduct,
  loading,
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
          Delete Product
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>Are you sure you want to delete the selected product?</p>
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={props.onHide} disabled={loading}>
          No
        </Button>
        <Button onClick={handleSingleDeleteProduct} disabled={loading}>
          Yes
        </Button>
      </Modal.Footer>
    </Modal>
  )
}

function ConfirmBatchDeleteModal({
  handleBatchDeleteProducts,
  loading,
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
          Delete Products
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>Are you sure you want to delete the selected products?</p>
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={props.onHide} disabled={loading}>
          No
        </Button>
        <Button onClick={handleBatchDeleteProducts} disabled={loading}>
          Yes
        </Button>
      </Modal.Footer>
    </Modal>
  )
}

export default ProductsContainer
