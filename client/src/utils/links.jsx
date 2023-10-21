import React from 'react'

import { IoBarChartSharp } from 'react-icons/io5'
import { MdQueryStats } from 'react-icons/md'
import { FaWpforms } from 'react-icons/fa'
import { ImProfile } from 'react-icons/im'
import {
  MdAdminPanelSettings,
  MdOutlineInventory2,
  MdOutlineInventory,
  MdOutlineDiscount,
} from 'react-icons/md'

const links = [
  { text: 'orders', path: 'add-product', icon: <FaWpforms /> },
  { text: 'all products', path: 'all-products', icon: <MdOutlineInventory2 /> },
  { text: 'inventory', path: 'inventory', icon: <MdOutlineInventory /> },
  { text: 'discounts', path: 'discounts', icon: <MdOutlineDiscount /> },
  { text: 'stats', path: '.', icon: <IoBarChartSharp /> },
  { text: 'profile', path: 'profile', icon: <ImProfile /> },
  { text: 'admin', path: 'admin', icon: <MdAdminPanelSettings /> },
]

export default links
