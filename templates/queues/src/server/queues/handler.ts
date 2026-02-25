// Example queue message type — replace with your own
interface QueueMessage {
	type: string;
	payload: unknown;
}

export async function handleBatch(
	batch: MessageBatch<unknown>,
	env: CloudflareEnv,
): Promise<void> {
	for (const message of batch.messages) {
		const body = message.body as QueueMessage;

		try {
			console.log(`Processing message: ${body.type}`, body.payload);

			// TODO: Add your queue processing logic here

			message.ack();
		} catch (error) {
			console.error(`Failed to process message: ${body.type}`, error);
			message.retry();
		}
	}
}

export async function handleDlqBatch(
	batch: MessageBatch<unknown>,
	env: CloudflareEnv,
): Promise<void> {
	for (const message of batch.messages) {
		const body = message.body as QueueMessage;

		console.error(
			`Dead letter queue message: ${body.type}`,
			JSON.stringify(body.payload),
		);

		// TODO: Add dead letter queue handling (alerting, logging, etc.)

		message.ack();
	}
}
