import React from 'react'

import { IoBarChartSharp } from 'react-icons/io5'
import { MdQueryStats } from 'react-icons/md'
import { FaWpforms } from 'react-icons/fa'
import { ImProfile } from 'react-icons/im'
import { MdAdminPanelSettings } from 'react-icons/md'

const links = [
  { text: 'add product', path: 'add-product', icon: <FaWpforms /> },
  { text: 'all products', path: 'all-products', icon: <MdQueryStats /> },
  { text: 'inventory', path: 'inventory', icon: <MdAdminPanelSettings /> },
  { text: 'stats', path: '.', icon: <IoBarChartSharp /> },
  { text: 'profile', path: 'profile', icon: <ImProfile /> },
  { text: 'admin', path: 'admin', icon: <MdAdminPanelSettings /> },
]

export default links