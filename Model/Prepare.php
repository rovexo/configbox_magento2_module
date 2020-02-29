<?php

namespace Rovexo\Configbox\Model;

use Exception;
use KenedoModel;
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
    protected $_registry;
    protected $_taxCalculation;
    protected $_storeManager;
    protected $_productMapperResource;
    protected $_productMapperFactory;

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
        Registry $registry,
        Calculation $taxCalculation,
        StoreManagerInterface $storeManager,
        ProductMapperFactory $productMapperFactory,
        ResourceModel\ProductMapper $productMapperResource
    ) {
        $this->_registry = $registry;
        $this->_taxCalculation = $taxCalculation;
        $this->_storeManager = $storeManager;
        $this->_productMapperFactory = $productMapperFactory;
        $this->_productMapperResource = $productMapperResource;
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
        $productMapper = $this->_productMapperFactory->create();
        $this->_productMapperResource->load(
            $productMapper,
            $magentoProductId,
            'magento_product_id'
        );
        return $productMapper->getId() ? $productMapper->getCbProductId() : null;
    }

    /**
     * @param object $product Magento product object
     * @return float Tax rate
     * @throws NoSuchEntityException
     */
    public function getTaxRate($product)
    {
        // Figure out the tax percentage of the product..
        $store = $this->_storeManager->getStore();
        $request = $this->_taxCalculation->getRateRequest(null, null, null, $store);
        $taxClassId = $product->getTaxClassId();
        $percent = $this->_taxCalculation->getRate(
            $request->setProductClassId($taxClassId)
        );
        return $percent;
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
            array(),
            array(),
            array(array('propertyName' => 'title', 'direction', 'ASC'))
        );
    }
}
