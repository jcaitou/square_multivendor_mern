import Table from 'react-bootstrap/Table'

const GuideProductUpload = () => {
  return (
    <>
      <h1>How to Upload Products</h1>
      <h2>Quickstart</h2>
      <p>
        Uploading products allows you to manage your product catalog way quicker
        than manually adding them one by one.
      </p>

      <p>
        If you are starting off fresh and do not have any products imported yet,
        download a copy of the template here.
      </p>
      <p>
        The template is already pre-filled with some examples to get you going.
        You just need to know these 2 ground rules:
      </p>
      <ol>
        <li>Do NOT edit the names of the header columns.</li>
        <li>
          Do NOT fill in productId/variationId columns unless you are trying to
          edit an existing product.
        </li>
      </ol>
      <h2>Field Explanations</h2>
      <p>
        For those who like to read, here is a detailed explanation of every
        field:
      </p>
      <section className='field-explanation'>
        <p>
          <strong>productName</strong>: The name of the product. If you include
          multiple rows with the exact same product name, you will create one
          single product with multiple variations.
          <br />
          Make sure you use the exact same name if the products are supposed to
          be grouped together.
        </p>
        <Table striped bordered>
          <thead>
            <tr>
              <th>productName</th>
              <th>variationName</th>
              <th>variationSku</th>
              <th>variationPrice</th>
              <th>productId</th>
              <th>variationId</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Life is Awesome T-shirt</td>
              <td>Large</td>
              <td>T-AWESOME-L</td>
              <td>24.97</td>
              <td></td>
              <td></td>
            </tr>
            <tr>
              <td>
                Life is Awesome <span className='text-danger'>Tee shirt</span>
              </td>
              <td>Medium</td>
              <td>T-AWESOME-M</td>
              <td>24.97</td>
              <td></td>
              <td></td>
            </tr>
            <tr>
              <td>Life is Awesome T-shirt</td>
              <td>Small</td>
              <td>T-AWESOME-S</td>
              <td>24.97</td>
              <td></td>
              <td></td>
            </tr>
          </tbody>
        </Table>
        <p>
          Uploading this file will create two <strong>new</strong> products:
          <br />
          "Life is Awesome T-shirt" with two variations (L, S)
          <br />
          "Life is Awesome" Tee shirt" with one variation (M)
          <br />
          Even if you already have an existing product called "Life is Awesome
          T-shirt", you'll make a new product on top of that with the exact same
          name.
        </p>
        <p>
          <strong>variationName</strong>: The variation of the product
          (optional). If your product has variations (for example, colors or
          sizes), you can distinguish between the different variations through
          this field.
          <br />
          For products with no variations, this is not required.
        </p>
        <p>
          <strong>variationSku</strong>: The stockkeeping unit of the variation.
          This is a very important field if you want to keep an accurate track
          of your inventory! For each unique variation which the inventory is
          important, make sure the SKU is also unique.
        </p>
        <p>
          <strong>variationPrice</strong>: The selling price of the product, in
          Canadian Dollars. You may use any amount with the smallest currency
          unit being $0.01 CAD.
          <br />
          Use numbers only. Do not use the '$' symbol.
          <br />
          This price includes any taxes that you are obligated to collect.
        </p>
        <p>
          <strong>productId</strong>: A unique ID for the product. This is
          automatically assigned by our system. In order words, you won't have a
          productId if you're trying to import a new product.
        </p>
        <p>
          <strong>variationId</strong>: A unique ID for the variation. Again,
          this is automatically assigned by our system and you won't have this
          field for new products.
          <br />
          Multiple products can have the same productId, but every single
          product will always have different variationIds.
        </p>

        <p>
          productIds and variationIds will become more important later once we
          start looking at editing products.
        </p>
      </section>
      <h2>Editing Exisiting Products</h2>
      <p>
        If you want to edit exisitng products, start by exporting a full list of
        your products. This product export list will already be pre-populated
        with productIds and variationIds (which we ignored for new products).
      </p>
      <p>
        The logic of the upload controller works like this. First, it tries to
        find a matching productId to the one you supplied. If nothing matches,
        then it just creates a new product entirely. Note that this includes
        typos!
      </p>
      <p></p>
      <h4>Orignal Exported File</h4>
      <Table striped bordered>
        <thead>
          <tr>
            <th>productName</th>
            <th>variationName</th>
            <th>variationSku</th>
            <th>variationPrice</th>
            <th>productId</th>
            <th>variationId</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Work Less Play More Mug</td>
            <td>Work Less Play More Mug</td>
            <td>M-PLAYMORE</td>
            <td>22.97</td>
            <td className='text-success'>SM7LLAJADKQ5</td>
            <td className='text-success'>DV5IX6WKEYLO</td>
          </tr>
        </tbody>
      </Table>

      <h4>Your Edited File</h4>
      <Table striped bordered>
        <thead>
          <tr>
            <th>productName</th>
            <th>variationName</th>
            <th>variationSku</th>
            <th>variationPrice</th>
            <th>productId</th>
            <th>variationId</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className='text-info'>Play More Work Less Mug</td>
            <td>Play More Work Less Mug</td>
            <td>M-WORKLESS</td>
            <td>22.97</td>
            <td className='text-success'>SM7LLAJADKQ5</td>
            <td className='text-success'>DV5IX6WKEYLO</td>
          </tr>
        </tbody>
      </Table>
      <p>You will have one product called "Play More Work Less Mug"</p>
      <Table striped bordered>
        <thead>
          <tr>
            <th>productName</th>
            <th>variationName</th>
            <th>variationSku</th>
            <th>variationPrice</th>
            <th>productId</th>
            <th>variationId</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className='text-info'>Play More Work Less Mug</td>
            <td>Play More Work Less Mug</td>
            <td>M-WORKLESS</td>
            <td>22.97</td>
            <td className='text-danger'>SM7LLAJADKQ78</td>
            <td className='text-success'>DV5IX6WKEYLO</td>
          </tr>
        </tbody>
      </Table>
      <p>
        Your original product "Work Less Play More Mug" will not be changed at
        all, and you will have an additional new product called "Play More Work
        Less Mug".
      </p>

      <h3>Adding a new variation to a product</h3>
      <p>
        Once the productId is matched, then we look at the variationId. The same
        logic applies. If we are able to find a match for the variationId, then
        that specific product is edited. Otherwise, a new variation of the
        product is created.
      </p>
      <h4>Orignal Exported File</h4>
      <Table striped bordered>
        <thead>
          <tr>
            <th>productName</th>
            <th>variationName</th>
            <th>variationSku</th>
            <th>variationPrice</th>
            <th>productId</th>
            <th>variationId</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Life is Awesome T-shirt</td>
            <td>Large</td>
            <td>T-AWESOME-L</td>
            <td>24.97</td>
            <td>PI5TFMASHAWC</td>
            <td className='text-success'>STQ5KN42WKF4</td>
          </tr>
          <tr>
            <td>Life is Awesome T-shirt</td>
            <td>Medium</td>
            <td>T-AWESOME-M</td>
            <td>24.97</td>
            <td>PI5TFMASHAWC</td>
            <td>CAQHRIQU3F2R</td>
          </tr>
          <tr>
            <td>Life is Awesome T-shirt</td>
            <td>Small</td>
            <td>T-AWESOME-S</td>
            <td>24.97</td>
            <td>PI5TFMASHAWC</td>
            <td>EGBWXAKOTEUT</td>
          </tr>
        </tbody>
      </Table>
      <h4>Your Edited File</h4>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>productName</th>
            <th>variationName</th>
            <th>variationSku</th>
            <th>variationPrice</th>
            <th>productId</th>
            <th>variationId</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Life is Awesome T-shirt</td>
            <td className='text-info'>Extra Large</td>
            <td>T-AWESOME-XL</td>
            <td>24.97</td>
            <td>PI5TFMASHAWC</td>
            <td className='text-success'>STQ5KN42WKF4</td>
          </tr>
          <tr>
            <td>Life is Awesome T-shirt</td>
            <td>Medium</td>
            <td>T-AWESOME-M</td>
            <td>24.97</td>
            <td>PI5TFMASHAWC</td>
            <td>CAQHRIQU3F2R</td>
          </tr>
          <tr>
            <td>Life is Awesome T-shirt</td>
            <td>Small</td>
            <td>T-AWESOME-S</td>
            <td>24.97</td>
            <td>PI5TFMASHAWC</td>
            <td>EGBWXAKOTEUT</td>
          </tr>
          <tr>
            <td>Life is Awesome T-shirt</td>
            <td className='text-info'>Extra Small</td>
            <td>T-AWESOME-XS</td>
            <td>24.97</td>
            <td>PI5TFMASHAWC</td>
            <td></td>
          </tr>
        </tbody>
      </Table>
      <p>
        Your original product "Life is Awesome T-shirt" now has four variants:
        Extra Large, Medium, Small, Extra Small. You do not have the Large
        variant because it was changed to Extra Large.
      </p>
    </>
  )
}

export default GuideProductUpload
