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
  MdOutlineHowToReg,
} from 'react-icons/md'
import { IoCreateOutline } from 'react-icons/io5'
import { TbBug } from 'react-icons/tb'
import { FaSignature } from 'react-icons/fa'

export const links = [
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
  { text: 'test orders', path: 'test-orders', icon: <IoCreateOutline /> },
  { text: 'feedback', path: 'feedback', icon: <TbBug /> },
  { text: 'contract', path: 'contract', icon: <FaSignature /> },
  { text: 'resources', path: 'resources', icon: <MdOutlineHowToReg /> },
]

export const adminLinks = [
  {
    text: 'register a vendor',
    path: 'admin/register',
    icon: <GiReceiveMoney />,
  },
  { text: 'orders', path: 'all-orders', icon: <GiReceiveMoney /> },
  { text: 'sales by product', path: 'item-sales', icon: <MdOutlineBarChart /> },
  { text: 'discounts', path: 'discounts', icon: <MdOutlineDiscount /> },
  {
    text: 'settings',
    path: 'settings',
    icon: <MdSettings />,
  },
  {
    text: 'contracts (adm)',
    path: 'admin/contracts',
    icon: <FaSignature />,
  },
  {
    text: 'rent status (adm)',
    path: 'admin/payments',
    icon: <GiReceiveMoney />,
  },
]

export const guideLinks = [
  {
    text: 'Getting Started',
    path: 'getting-started',
    icon: <GiReceiveMoney />,
  },
  {
    text: 'Uploading Products',
    path: 'how-to-upload-products',
    icon: <GiReceiveMoney />,
  },
  {
    text: 'Uploading Inventory',
    path: 'how-to-upload-inventory',
    icon: <GiReceiveMoney />,
  },
]
//
// export default { links, adminLinks }
