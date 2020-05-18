const config = require('config');
class ProviderService {
    async getProviderData(providerData) {
        const providerUrl = `${config.providerBaseUrl}/${providerData.provider}`;
        axios.get(providerUrl)
            .then((response) => {
                if (response.status === '200') {
                    return {
                        status: 'SUCCESS',
                        result: {
                            provider: providerData.provider,
                            callbackUrl: providerData.callbackUrl,
                            data: response.dat
                        }
                    };
                };
                return {
                        status: 'FAILED',
                        result: {}
                    };
                });
            }
        }
module.exports = ProviderService
