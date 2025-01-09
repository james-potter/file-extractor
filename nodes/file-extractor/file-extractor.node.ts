import { INodeType, INodeTypeDescription } from 'n8n-workflow';
import { fromBuffer } from 'any-text';

export class AnyTextReader implements INodeType {
	description: INodeTypeDescription = {
			displayName: 'Any Text Reader',
			name: 'anyTextReader',
			group: ['transform'],
			version: 1,
			description: 'Reads binary content using any-text library and extracts text',
			defaults: {
					name: 'Any Text Reader',
			},
			inputs: ['main'],
			outputs: ['main'],
			properties: [
					{
							displayName: 'Binary Property Name',
							name: 'binaryPropertyName',
							type: 'string',
							default: 'data',
							placeholder: 'Name of the binary property to process',
							description: 'The name of the binary property containing the file data',
					},
			],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
			const items = this.getInputData();
			const returnData: INodeExecutionData[] = [];
			const binaryPropertyName = this.getNodeParameter('binaryPropertyName', 0) as string;

			for (let i = 0; i < items.length; i++) {
					try {
							const binaryData = items[i].binary?.[binaryPropertyName];

							if (!binaryData) {
									throw new NodeOperationError(this.getNode(), `No binary data found for property "${binaryPropertyName}"`);
							}

							const buffer = Buffer.from(binaryData.data, 'base64');
							const extractedText = await fromBuffer(buffer);

							const newItem: INodeExecutionData = {
									json: {
											extractedText,
									},
									binary: items[i].binary,
							};

							returnData.push(newItem);
					} catch (error) {
							if (this.continueOnFail()) {
									returnData.push({ json: { error: error.message } });
									continue;
							}
							throw error;
					}
			}

			return [returnData];
	}
}
