import { guideLinks } from '../utils/links'
import { NavLink } from 'react-router-dom'

const Guides = () => {
  return (
    <>
      <div>Guides</div>

      {guideLinks.map((link) => {
        const { text, path, icon } = link

        return (
          <NavLink to={path} key={text} className='nav-link' end>
            {/* <span className='icon'>{icon}</span> */}
            {text}
          </NavLink>
        )
      })}
    </>
  )
}

export default Guides
