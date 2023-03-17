const userController = require('../../controllers/user-controllers')

test('add 1 + 1', () => {
		
})

test('getProductById fails if no productId is passed', () => {
  const req = {}
		req.params = {}
		req.params.id = 10

		console.log(userController.getProductById(req))
})
