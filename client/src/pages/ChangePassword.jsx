import { Form, redirect } from 'react-router-dom'
import { UncontrolledFormRow, SubmitBtn } from '../components'
import customFetch from '../utils/customFetch'
import { toast } from 'react-toastify'

export const action = async ({ request, params }) => {
  const formData = await request.formData()
  const data = Object.fromEntries(formData)

  try {
    await customFetch.post('/auth/update-password', data)
    toast.success('Password updated successfully')
    return redirect('/dashboard')
  } catch (error) {
    toast.error(error?.response?.data?.msg)
    return error
  }
}

const ChangePassword = () => {
  return (
    <>
      <h2>Change Password</h2>
      <Form method='post' className='form'>
        <UncontrolledFormRow
          type='password'
          name='oldPassword'
          labelText='Current Password'
          defaultValue=''
        />
        <UncontrolledFormRow
          type='password'
          name='newPassword'
          labelText='New Password'
          defaultValue=''
        />
        <UncontrolledFormRow
          type='password'
          name='confirmNewPassword'
          labelText='Confirm New Password'
          defaultValue=''
        />

        <SubmitBtn formBtn />
      </Form>
    </>
  )
}

export default ChangePassword
