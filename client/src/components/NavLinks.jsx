import { useDashboardContext } from '../pages/DashboardLayout'
import links from '../utils/links'
import { setReportDefaultPeriod } from '../utils/setReportDefaultPeriod'
import { NavLink } from 'react-router-dom'

const NavLinks = ({ isBigSidebar }) => {
  const { user, toggleSidebar } = useDashboardContext()

  return (
    <div className='nav-links'>
      {links.map((link) => {
        const { text, path: rawPath, icon } = link
        var path
        if (rawPath === 'all-orders' || rawPath === 'item-sales') {
          path = setReportDefaultPeriod(
            rawPath,
            user.settings.defaultReportPeriod
          )
        } else {
          path = rawPath
        }

        // admin user
        return (
          <NavLink
            to={path}
            key={text}
            onClick={isBigSidebar ? null : toggleSidebar}
            className='nav-link'
            end
          >
            <span className='icon'>{icon}</span>
            {text}
          </NavLink>
        )
      })}
    </div>
  )
}

export default NavLinks
