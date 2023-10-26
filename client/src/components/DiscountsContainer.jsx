import { useState } from 'react'
import { useAllDiscountsContext } from '../pages/AllDiscounts'
import { Link, useNavigate } from 'react-router-dom'
import Wrapper from '../assets/wrappers/ProductsContainer'
import Discount from './Discount'
import Button from 'react-bootstrap/Button'
import Modal from 'react-bootstrap/Modal'
import customFetch from '../utils/customFetch'
import { toast } from 'react-toastify'

const DiscountsContainer = () => {
  const { data: discounts } = useAllDiscountsContext()
  console.log(discounts.length)

  const [confirmDeleteDiscountModalShow, setConfirmDeleteDiscountModalShow] =
    useState(false)
  const [singleIdToDelete, setSingleIdToDelete] = useState(null)

  const confirmDeleteDiscount = (discountId) => {
    setSingleIdToDelete(discountId)
    setConfirmDeleteDiscountModalShow(true)
  }

  const handleDeleteDiscount = async () => {
    if (singleIdToDelete) {
      console.log('single delete discount')
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

  if (discounts.length === 0) {
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
        <div className='discounts'>
          {discounts.map((discount) => {
            return (
              <Discount
                key={discount.id}
                discount={discount}
                confirmDeleteDiscount={() => confirmDeleteDiscount(discount.id)}
              />
            )
          })}
        </div>
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
