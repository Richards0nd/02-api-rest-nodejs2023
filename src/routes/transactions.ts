import { FastifyInstance } from 'fastify'
import { knex } from '../database'
import { z } from 'zod'
import { randomUUID } from 'node:crypto'
import { checkSessionIdExists } from '../middlewares/check-session-id-exists'

export async function transactionsRoutes(app: FastifyInstance) {
	// Get all transactions
	app.get(
		'',
		{
			preHandler: [checkSessionIdExists]
		},
		async (req) => {
			const { sessionId } = req.cookies
			const transactions = await knex('transactions').select('*').where('session_id', sessionId)
			const totalTransactions = transactions.length
			return {
				total: totalTransactions,
				transactions
			}
		}
	)

	// Get specific transaction
	app.get(
		'/:id',
		{
			preHandler: [checkSessionIdExists]
		},
		async (req) => {
			const { sessionId } = req.cookies
			const getTransactionParamsSchema = z.object({
				id: z.string().uuid()
			})

			const { id } = getTransactionParamsSchema.parse(req.params)

			const transaction = await knex('transactions')
				.select('*')
				.where({
					session_id: sessionId,
					id
				})
				.first()

			return {
				transaction
			}
		}
	)

	// Get amount of all transactions
	app.get(
		'/summary',
		{
			preHandler: [checkSessionIdExists]
		},
		async (req) => {
			const { sessionId } = req.cookies
			const summary = await knex('transactions').sum('amount', { as: 'amount ' }).where('session_id', sessionId).first()
			return { summary }
		}
	)

	// Create a new transaction
	app.post('/', async (req, res) => {
		const createTransactionBodySchema = z.object({
			title: z.string(),
			amount: z.number(),
			type: z.enum(['credit', 'debit'])
		})

		const { title, amount, type } = createTransactionBodySchema.parse(req.body)

		let sessionId = req.cookies.sessionId

		if (!sessionId) {
			sessionId = randomUUID()
			res.cookie('sessionId', sessionId, {
				path: '/',
				maxAge: 1000 * 60 * 60 * 24 * 7 // 2 days
			})
		}

		await knex('transactions').insert({
			id: randomUUID(),
			title,
			amount: type === 'credit' ? amount : amount * -1,
			session_id: sessionId
		})

		return res.status(201).send({
			statusCode: 201,
			success: true
		})
	})
}
