import { Form, redirect, useNavigation } from 'react-router-dom'
import { UncontrolledFormRow, SubmitBtn } from '../components'
import customFetch from '../utils/customFetch'
import { toast } from 'react-toastify'
import { useDashboardContext } from './DashboardLayout'
import SwitchCheckboxWrapper from '../assets/wrappers/SwitchCheckbox'
import Wrapper from '../assets/wrappers/UserSettings'
import { useState } from 'react'

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
  const { user } = useDashboardContext()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const navigation = useNavigation()
  const isNavSubmitting = navigation.state === 'submitting'
  console.log(user)

  const debounce = (onChange) => {
    let timeout
    return (e) => {
      //const form = e.currentTarget.form
      clearTimeout(timeout)
      timeout = setTimeout(() => {
        onChange(e)
      }, 1000)
    }
  }

  // function debounce(func, timeout = 300) {
  //   let timer
  //   return (...args) => {
  //     clearTimeout(timer)
  //     timer = setTimeout(() => {
  //       func.apply(this, args)
  //     }, timeout)
  //   }
  // }

  const changeSettingsAction = async (e) => {
    console.log(e.target.name)
    console.log(e.target.type === 'checkbox')

    let setting = { key: e.target.name }
    if (e.target.type === 'checkbox') {
      setting.value = e.target.checked
    } else {
      setting.value = e.target.value
    }

    console.log(setting)

    try {
      setIsSubmitting(true)
      let response = await customFetch.patch(
        '/users/update-user-settings',
        setting
      )
      toast.success('User setting updated')
      setIsSubmitting(false)
    } catch (error) {
      console.log(error)
      toast.error(error?.response?.data?.msg)
      setIsSubmitting(false)
    }
  }

  return (
    <Wrapper>
      <section>
        <h2>Inventory Warnings</h2>
        <div className='setting-row'>
          <div className='setting-detail'>
            <h3>Email Setting</h3>
            <p>
              If this setting is off, you will never receive warning emails
              regarding inventory, even when it falls below the warning level or
              0.
            </p>
          </div>
          <div className='setting-input'>
            <SwitchCheckboxWrapper>
              <input
                className='switch-checkbox'
                type='checkbox'
                defaultChecked={user.settings.receiveInventoryWarningEmails}
                name='receiveInventoryWarningEmails'
                id='receiveInventoryWarningEmails'
                value='receiveInventoryWarningEmails'
                disabled={isSubmitting || isNavSubmitting}
                //disabled={isSubmitting || today >= decisionDate}
                onChange={(e) => changeSettingsAction(e)}
              />
            </SwitchCheckboxWrapper>
          </div>
        </div>
        <div className='setting-row'>
          <div className='setting-detail'>
            <h3>Default Warning Level</h3>
            <p>
              Set the default warning level for newly added products. You can
              always set unique warning values for every product under
              Inventory.
              <br />
              If the warning value is &lt; 0, the warning will only get
              triggered when the item is out of stock (quantity = 0).
            </p>
          </div>
          <div className='setting-input'>
            <input
              type='number'
              name='defaultInventoryWarningLevel'
              min='-1'
              disabled={isSubmitting || isNavSubmitting}
              defaultValue={user.settings.defaultInventoryWarningLevel || -1}
              onChange={debounce((e) => {
                changeSettingsAction(e)
              })}
            />
          </div>
        </div>
      </section>
      <section>
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

          <button
            type='submit'
            className={`btn btn-block form-btn`}
            disabled={isSubmitting || isNavSubmitting}
          >
            {isSubmitting || isNavSubmitting ? 'submitting...' : 'submit'}
          </button>
        </Form>
      </section>
    </Wrapper>
  )
}

export default ChangePassword
