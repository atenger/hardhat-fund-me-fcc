// import

//main function

//calling of main function
const { networkConfig, developmentChains } = require("../helper-hardhat-config")
const { network } = require("hardhat")
const { verify } = require("../utils/verify")

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId

    let ethUsdPriceFeedAddress
    if (developmentChains.includes(network.name)) {
        const ethUsdAggregator = await deployments.get("MockV3Aggregator")
        ethUsdPriceFeedAddress = ethUsdAggregator.address
    } else {
        ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"]
    }
    //const ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"]

    const args = [ethUsdPriceFeedAddress]

    const fundMe = await deploy("FundMe", {
        from: deployer,
        args: args, // price feed
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1,
    })

    //verify if not on a dev chain!
    if (
        !developmentChains.includes(network.name) &&
        process.env.ETHERSCAN_API_KEY
    ) {
        log("adding auto verify now")
        await verify(fundMe.address, args)
    }

    log("---------------------------------------------")
}

module.exports.tags = ["all", "fundme"]
