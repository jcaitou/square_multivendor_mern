import { useState } from 'react'
import { useAllDiscountsContext } from '../pages/AllDiscounts'
import { Link, useNavigate } from 'react-router-dom'
import Wrapper from '../assets/wrappers/ProductsContainer'
import Discount from './Discount'
import Button from 'react-bootstrap/Button'
import Modal from 'react-bootstrap/Modal'
import customFetch from '../utils/customFetch'
import { toast } from 'react-toastify'
import PageBtnContainer from '../components/PageBtnContainer'

const DiscountsContainer = () => {
  const {
    data: { discounts, numOfPages, totalItems, currentPage },
    storewideDiscounts,
  } = useAllDiscountsContext()
  const navigate = useNavigate()

  const [confirmDeleteDiscountModalShow, setConfirmDeleteDiscountModalShow] =
    useState(false)
  const [singleIdToDelete, setSingleIdToDelete] = useState(null)

  const confirmDeleteDiscount = (discountId) => {
    setSingleIdToDelete(discountId)
    setConfirmDeleteDiscountModalShow(true)
  }

  const handleDeleteDiscount = async () => {
    if (singleIdToDelete) {
      setConfirmDeleteDiscountModalShow(false)
      try {
        let response = await customFetch.delete(
          `/discounts/${singleIdToDelete}`
        )
        toast.success('Discount deleted successfully')
        setSingleIdToDelete(null)
        navigate('/dashboard/discounts', { replace: true })
      } catch (error) {
        console.log(error)
        toast.error(error?.response?.data?.msg)
      }
    }
  }

  if (discounts.length === 0 && storewideDiscounts.length === 0) {
    return (
      <Wrapper>
        <div className='product-actions'>
          <div className='grouped-actions'>
            <Link to={'../add-discount'} className='btn'>
              Add Discount
            </Link>
          </div>
        </div>
        <h2>No discounts to display...</h2>
      </Wrapper>
    )
  }
  return (
    <>
      <Wrapper>
        <div className='product-actions'>
          <div className='grouped-actions'>
            <Link to={'../add-discount'} className='btn'>
              Add Discount
            </Link>
          </div>
        </div>
        <h2>Storewide Discounts</h2>
        {storewideDiscounts.length > 0 && (
          <div className='discounts'>
            {storewideDiscounts.map((storewideDiscount) => {
              const discount = storewideDiscount.find((el) => {
                return el.type === 'PRICING_RULE'
              })
              const productSet = storewideDiscount.find((el) => {
                return el.type === 'PRODUCT_SET'
              })
              return (
                <Discount
                  key={discount.id}
                  discount={discount}
                  storewide={true}
                  productSet={productSet}
                  confirmDeleteDiscount={() =>
                    confirmDeleteDiscount(discount.id)
                  }
                />
              )
            })}
          </div>
        )}
        <h2>Vendor Discounts</h2>
        {discounts.length > 0 && (
          <div className='discounts'>
            {discounts.map((discount) => {
              return (
                <Discount
                  key={discount.id}
                  discount={discount}
                  storewide={false}
                  confirmDeleteDiscount={() =>
                    confirmDeleteDiscount(discount.id)
                  }
                />
              )
            })}
          </div>
        )}
        {discounts.length > 0 && (
          <PageBtnContainer numOfPages={numOfPages} currentPage={currentPage} />
        )}
      </Wrapper>

      <ConfirmDiscountDeleteModal
        handleDeleteDiscount={handleDeleteDiscount}
        show={confirmDeleteDiscountModalShow}
        onHide={() => setConfirmDeleteDiscountModalShow(false)}
      />
    </>
  )
}

function ConfirmDiscountDeleteModal({ handleDeleteDiscount, ...props }) {
  return (
    <Modal
      {...props}
      size='lg'
      aria-labelledby='contained-modal-title-vcenter'
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title id='contained-modal-title-vcenter'>
          Delete Discount
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>Are you sure you want to delete the selected discount?</p>
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={props.onHide}>No</Button>
        <Button onClick={handleDeleteDiscount}>Yes</Button>
      </Modal.Footer>
    </Modal>
  )
}

export default DiscountsContainer
