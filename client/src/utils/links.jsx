import React from 'react'

import { IoBarChartSharp } from 'react-icons/io5'
import { MdQueryStats } from 'react-icons/md'
import { FaWpforms } from 'react-icons/fa'
import { GiReceiveMoney } from 'react-icons/gi'
import {
  MdAdminPanelSettings,
  MdOutlineInventory2,
  MdOutlineInventory,
  MdOutlineDiscount,
  MdUploadFile,
  MdOutlinePassword,
  MdOutlineBarChart,
  MdSettings,
} from 'react-icons/md'

const links = [
  { text: 'orders', path: 'all-orders', icon: <GiReceiveMoney /> },
  { text: 'sales by product', path: 'item-sales', icon: <MdOutlineBarChart /> },
  { text: 'products', path: 'all-products', icon: <MdOutlineInventory2 /> },
  { text: 'inventory', path: 'inventory', icon: <MdOutlineInventory /> },
  { text: 'discounts', path: 'discounts', icon: <MdOutlineDiscount /> },
  { text: 'imports', path: 'file-actions', icon: <MdUploadFile /> },
  {
    text: 'settings',
    path: 'settings',
    icon: <MdSettings />,
  },
]

export default links
