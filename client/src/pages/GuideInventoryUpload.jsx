import Table from 'react-bootstrap/Table'

const GuideInventoryUpload = () => {
  return (
    <>
      <h1>How to Update Inventory</h1>
      <h2>Quickstart</h2>
      <p>
        First of all, note that inventory can only be updated if you have
        already moved into our store and started the contract.
      </p>

      <Table striped bordered>
        <thead>
          <tr>
            <th>Product Name </th>
            <th>SKU </th>
            <th>Richmond Center</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Life is Awesome T-shirt</td>
            <td></td>
            <td></td>
          </tr>
          <tr>
            <td>&emsp;Large</td>
            <td>T-AWESOME-L </td>
            <td>0</td>
          </tr>
          <tr>
            <td>&emsp;Medium</td>
            <td>T-AWESOME-M </td>
            <td>0</td>
          </tr>
          <tr>
            <td>&emsp;Small</td>
            <td>T-AWESOME-S </td>
            <td>0</td>
          </tr>
        </tbody>
      </Table>

      <p>
        If you can only see two columns for Product Name and SKU, that means the
        inventory function of your account is not active yet.
        <br />
        Once you can see locations in the table view, then you are ready to keep
        going with this guide.
      </p>

      <p>
        Always start by exporting a full list of the current inventory count
        from your inventory page.{' '}
        <strong>Save this file somewhere and do not write over it!</strong> (Use
        "Save As" instead). This is important because if you make a mistake,
        this is the only file you have as a backup.
      </p>
      <p>
        Editing inventory is much simpler than adding products. In fact, only
        the "Variation ID" and "Location" columns are required. All the other
        columns - Product Name, SKU, etc - are just for your own reference.
      </p>
      <p>
        There are two different types of Inventory Updates - Restocks and
        Recounts. They work exactly the way you expect them to work, but here is
        a detailed explanation anyway:
      </p>
      <h2>Restocks</h2>
      <p>
        99% of the time you want to import a restock rather than a recount.
        Restocks reflect the number of items that you are bringing into (or
        taking away from) a store.
      </p>
      <p>
        If you are bringing 5 Work Less Play More Mugs to restock, then your
        file would look like this:
      </p>
      <Table striped bordered>
        <thead>
          <tr>
            <th>Product Name </th>
            <th>Product ID</th>
            <th>Variation Name </th>
            <th>Variation SKU </th>
            <th>Variation ID</th>
            <th>Richmond Center</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Work Less Play More Mug</td>
            <td>HOQJWMTY</td>
            <td>Work Less Play More Mug</td>
            <td>M-PLAYMORE</td>
            <td>TACDBTVG</td>
            <td>5</td>
          </tr>
        </tbody>
      </Table>
      <p>This means that:</p>
      <ul>
        <li>
          It does not matter how much stock you have currently at the location.
        </li>
        <li>
          It does not matter what time you upload the inventory restock file (as
          long as you do it sometime).
        </li>
      </ul>
      <p>
        The restock file can also include negative numbers if you are removing
        items from a store.
      </p>
      <h2>Recounts</h2>
      <p>
        Recounts are usuallly performed once a year, or when need arises. The
        assumption is that your inventory will not be too far off the value
        indicated in the system throughout the year, and we only need to
        re-align it once a year.
      </p>
      <p>
        Depending on your product, you may find yourself requiring a few more
        recounts throughout the year (eg. once per quarter instead of yearly).
        Usually, we perform more recounts if the product is small, easily
        misplaced, and high in value. Some telling signs, such as the system
        showing a negative quantity, is also a sign that a recount should be
        conducted.
      </p>
      <p>
        If you are have recounted your stock of Work Less Play More Mugs and you
        counted 15, then your file would look like this:
      </p>
      <Table striped bordered>
        <thead>
          <tr>
            <th>Product Name </th>
            <th>Product ID</th>
            <th>Variation Name </th>
            <th>Variation SKU </th>
            <th>Variation ID</th>
            <th>Richmond Center</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Work Less Play More Mug</td>
            <td>HOQJWMTY</td>
            <td>Work Less Play More Mug</td>
            <td>M-PLAYMORE</td>
            <td>TACDBTVG</td>
            <td>15</td>
          </tr>
        </tbody>
      </Table>
      <p>When you perform a recount, make sure that:</p>
      <ul>
        <li>
          It is performed before/after business hours (so that there is no
          chance of the inventory being changed during the recount process).
        </li>
        <li>The recount file is uploaded as soon as possible.</li>
      </ul>
      <p>
        Note: the 'quick edit' button on the Inventory page is a{' '}
        <span>recount</span> function!
      </p>
      <h2>Recounts vs Restocks</h2>
      <p>
        If it sounds like you can just use a recount instead of a restock, you
        are right. You can always download a copy of the current stock, add the
        amount you are planning to restock, and then upload the file.
      </p>
      <p>
        However, consider this case:
        <br />
        9AM: The store has 5 mugs in stock. You download a copy of your
        inventory and it tells you 5. You are planning to bring in 10 more mugs,
        so on the file you write 15 and you will upload this as a recount.
        <br />
        10AM - 1PM: 3 mugs were sold, and now there's actually only 2 left.
        <br />
        2PM: You finally have time to make a trip to the store to drop off the
        mugs. After you drop them off, you go home and upload the file you
        prepared.
      </p>
      <p>
        There's actually only 2 + 10 = 12 mugs in the store, but your uploaded
        file (and hence the database) says 15 . This is where inventory
        inconsistencies start!
      </p>
      <p>
        The key is that the restock function omits the time element of the
        process. If you are bringing in 10 mugs, it doesn't matter what time you
        perform the +10 addition - the answer is still correct.
      </p>
      <p>
        We offer you tools to keep your inventory accurate, and you would be
        doing yourself a lot of favours by using them.
      </p>
    </>
  )
}

export default GuideInventoryUpload
