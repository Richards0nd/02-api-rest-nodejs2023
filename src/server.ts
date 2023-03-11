import { app } from './app'
import { env } from './env'

app
	.listen({
		port: env.SERVER_PORT
	})
	.then(() => {
		console.log('Server listening on port 3000')
	})
	.catch((err) => {
		console.log(err)
	})
