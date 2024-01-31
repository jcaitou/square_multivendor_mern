import { Link } from 'react-router-dom'

const WelcomeGuide = () => {
  return (
    <>
      <h2>Get Started</h2>
      <p>
        Welcome to the WeCreate Vendor Platform! Here’s your chance to explore
        what we offer before you decide to fully commit.
      </p>
      <ol>
        <li>
          Import your <Link to='/dashboard/all-products'>product catalog</Link>.
          You can manually enter product information, or you can upload them all
          at once (see our{' '}
          <Link to='/dashboard/resources/how-to-upload-products'>
            product upload guide
          </Link>
          ).
        </li>
        <li>
          Simulate an inventory restock by{' '}
          <Link to='/dashboard/inventory'>intializing some inventory</Link>.
          Again, you can enter the values one by one, or you can follow our{' '}
          <Link to='/dashboard/resources/how-to-upload-inventory'>
            inventory upload guide
          </Link>
          .
        </li>
        <li>
          Generate a <Link to='/dashboard/test-orders'>test order</Link>. Test
          orders cannot be generated until your products are imported.
          <br />
          Remember that products that are out of stock cannot be purchased!
        </li>

        <li>
          Check your <Link to='/dashboard/all-orders'>order reports</Link> and{' '}
          <Link to='/dashboard/item-sales'>sales reports</Link> periodically.
        </li>
        <li>
          Check your email for inventory warnings and restock when inventory is
          running low so you can continue selling.
        </li>
      </ol>
    </>
  )
}

export default WelcomeGuide
