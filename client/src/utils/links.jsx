import React from 'react'

import { IoBarChartSharp } from 'react-icons/io5'
import { MdQueryStats } from 'react-icons/md'
import { FaWpforms } from 'react-icons/fa'
import { GiReceiveMoney } from 'react-icons/gi'
import { GiPayMoney } from 'react-icons/gi'

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
import { FaMoneyBillWave } from 'react-icons/fa'
import { FaMedal } from 'react-icons/fa'

import { FaUserCheck } from 'react-icons/fa'
import { GoChecklist } from 'react-icons/go'
import { FaRegMoneyBillAlt } from 'react-icons/fa'

export const links = [
  { text: 'orders', path: 'all-orders', icon: <GiReceiveMoney /> },
  { text: 'sales by product', path: 'item-sales', icon: <MdOutlineBarChart /> },
  { text: 'products', path: 'all-products', icon: <MdOutlineInventory2 /> },
  { text: 'inventory', path: 'inventory', icon: <MdOutlineInventory /> },
  { text: 'discounts', path: 'discounts', icon: <MdOutlineDiscount /> },
  { text: 'imports', path: 'file-actions', icon: <MdUploadFile /> },

  { text: 'contract', path: 'contract', icon: <FaSignature /> },
  { text: 'payouts', path: 'payouts', icon: <FaMoneyBillWave /> },
  { text: 'resources', path: 'resources', icon: <MdOutlineHowToReg /> },
  {
    text: 'settings',
    path: 'settings',
    icon: <MdSettings />,
  },
  { text: 'test orders', path: 'test-orders', icon: <IoCreateOutline /> },
  { text: 'feedback', path: 'feedback', icon: <TbBug /> },
]

export const adminLinks = [
  {
    text: 'register a vendor',
    path: 'admin/register',
    icon: <FaUserCheck />,
  },
  {
    text: 'add new contract',
    path: 'admin/add-contract',
    icon: <GoChecklist />,
  },
  { text: 'orders', path: 'all-orders', icon: <GiReceiveMoney /> },
  { text: 'sales by product', path: 'item-sales', icon: <MdOutlineBarChart /> },
  {
    text: 'sales by vendor',
    path: 'admin/sales-by-vendor',
    icon: <FaMedal />,
  },
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
    icon: <FaRegMoneyBillAlt />,
  },
  { text: 'payouts (adm)', path: 'admin/payouts', icon: <GiPayMoney /> },
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
