import { Link, Form, redirect, useNavigation } from 'react-router-dom'
import Wrapper from '../assets/wrappers/Feedback'
import { FormRow, Logo } from '../components'
import customFetch from '../utils/customFetch'
import { toast } from 'react-toastify'

export const action = async ({ request }) => {
  const formData = await request.formData()
  const data = Object.fromEntries(formData)
  try {
    await customFetch.post('/uploads/feedback', data)
    toast.success('Feedback has been submitted. Thank you!')
    return redirect('/dashboard')
  } catch (error) {
    toast.error(error?.response?.data?.msg)
    return error
  }
}

const Feedback = () => {
  const navigation = useNavigation()
  const isSubmitting = navigation.state === 'submitting'
  return (
    <Wrapper>
      <p>
        Please let us know if there are any bugs, or if you have any comments
        for improvement in general.
      </p>
      <Form method='post' className='form'>
        <FormRow type='text' name='subject' />
        <FormRow type='textarea' rows='6' name='message' />
        <button type='submit' className='btn btn-block' disabled={isSubmitting}>
          {isSubmitting ? 'submitting...' : 'submit'}
        </button>
      </Form>
    </Wrapper>
  )
}
export default Feedback
