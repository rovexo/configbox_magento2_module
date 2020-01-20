<?php

namespace Rovexo\Configbox\Model;

use ConfigboxConfiguration;
use Exception;
use KenedoModel;
use KRequest;
use KSession;
use Magento\Catalog\Model\Product\Interceptor;
use Magento\Framework\Exception\NoSuchEntityException;
use Magento\Framework\Registry;
use Magento\Store\Model\StoreManagerInterface;
use Magento\Tax\Model\Calculation;

/**
 * Class Prepare
 *
 * @category Rovexo
 * @package  Rovexo/Configbox
 * @author   Rovexo SIA <office@rovexo.com>
 * @license  https://www.configbox.at/eula ConfigBox License
 * @link     https://www.configbox.at
 */
class Prepare
{
    public static $prepared = false;

    protected $registry;

    protected $taxCalculation;

    protected $storeManager;

    protected $productMapperResource;

    protected $productMapperFactory;

    /**
     * Prepare constructor.
     *
     * @param Registry                    $registry              Registry object
     * @param Calculation                 $taxCalculation        Calculation object
     * @param StoreManagerInterface       $storeManager          StoreManager object
     * @param ProductMapperFactory        $productMapperFactory  Product Mapper
     * @param ResourceModel\ProductMapper $productMapperResource Product Mapper
     */
    public function __construct(
        Registry $registry, //  @TODO: Replace deprecated code
        Calculation $taxCalculation,
        StoreManagerInterface $storeManager,
        ProductMapperFactory $productMapperFactory,
        ResourceModel\ProductMapper $productMapperResource
    ) {
        $this->registry = $registry;
        $this->taxCalculation = $taxCalculation;
        $this->storeManager = $storeManager;
        $this->productMapperFactory = $productMapperFactory;
        $this->productMapperResource = $productMapperResource;
    }

    /**
     * Prepare configurator
     *
     * @return void
     * @throws NoSuchEntityException
     */
    public function prepareConfigurator()
    {
        if (self::$prepared == true) {
            return;
        }

        self::$prepared = true;

        // Get the Magento product data
        /**
         * Interceptor
         *
         * @var Interceptor
         */
        $mageProduct = $this->registry->registry('current_product');
        $mageProductId = $mageProduct->getId();

        // Find the ID of the first CB option
        $optionId = null;
        $options = $mageProduct->getOptions();
        foreach ($options as $option) {
            if ($option->getType() == 'configbox') {
                $optionId = $option->getId();
                break;
            }
        }

        // Figure out the tax percentage of the product..
        $store = $this->storeManager->getStore();
        $request = $this->taxCalculation->getRateRequest(null, null, null, $store);
        $taxClassId = $mageProduct->getTaxClassId();
        $percent = $this->taxCalculation->getRate(
            $request->setProductClassId($taxClassId)
        );
        // ..and drop it in a session var, will get picked up by ConfigboxPrices
        KSession::set('cbtaxrate', $percent);

        $preconfiguredValues = $mageProduct->getPreconfiguredValues();
        $customOptions = $preconfiguredValues->getData('options');

        $pageModel = KenedoModel::getModel('ConfigboxModelConfiguratorpage');

        // If we got a config info, set the selections accordingly or make a new one
        if ($optionId && !empty($customOptions[$optionId])) {
            $configInfo = json_decode($customOptions[$optionId], true);

            $positionModel = KenedoModel::getModel('ConfigboxModelCartposition');
            $positionId = $configInfo['position_id'];
            $position = $positionModel->getPosition($positionId);

            // If the position is not there, create a position and set the selections
            if ($position) {
                $positionModel->setId($positionId);
                $data = array('finished' => 0);
                $positionModel->editPosition($positionId, $data);
            } else {
                $positionId = $pageModel->ensureProperCartEnvironment(
                    $configInfo['prod_id']
                );
                $configuration = ConfigboxConfiguration::getInstance($positionId);

                // Remove any defaults..
                $configurationSelections = $configuration->getSelections(false);
                foreach ($configurationSelections as $questionId => $selection) {
                    $configuration->setSelection($questionId, null);
                }

                // ..then set the selections from the config info
                foreach ($configInfo['selections'] as $questionId => $selection) {
                    $configuration->setSelection($questionId, $selection);
                }
            }
        } else {
            $productId = $this->getCbProductId($mageProductId);
            $pageModel->ensureProperCartEnvironment($productId);
        }

        // The page_id request var will be picked up in the configurator template
        if (KRequest::getInt('page_id', 0) == 0) {
            $prodModel = KenedoModel::getModel('ConfigboxModelProduct');
            $productId = $this->getCbProductId($mageProductId);
            $product = $prodModel->getProduct($productId);
            KRequest::setVar('page_id', $product->firstPageId);
        }
    }

    /**
     * Get CB Product ID
     *
     * @param int $magentoProductId Magento product ID
     *
     * @return int|null
     * @throws Exception
     */
    public function getCbProductId($magentoProductId)
    {
        $productMapper = $this->productMapperFactory->create();
        $this->productMapperResource->load(
            $productMapper,
            $magentoProductId,
            'magento_product_id'
        );
        return $productMapper->getId() ? $productMapper->getCbProductId() : null;
    }

    /**
     * List is sorted by title
     *
     * @throws Exception
     * @return object[]
     */
    public function getCbProducts()
    {
        $model = KenedoModel::getModel('ConfigboxModelAdminProducts');
        return $model->getRecords(
            [],
            [],
            [['propertyName' => 'title', 'direction', 'ASC']]
        );
    }
}
