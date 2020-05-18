class ProviderResponseService {
    async postProviderData(resultData) {
        const callBackUrl = providerData.callBackUrl;
        axios.post(callBackUrl, resultData)
            .then((response) => {
                console.log(response);
                return {
                    status: 'SUCCESS'
                }
            }, (error) => {
                console.log(error);
                return {
                    status: 'FAILED'
                }
            });

    }
}
module.exports = ProviderResponseService
