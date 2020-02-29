<?php

namespace Rovexo\Configbox\Block\Product\View\Options\Type;

use Rovexo\Configbox\Model\Prepare;

/**
 * Class ConfigBoxConfigurator
 *
 * @category Rovexo
 * @package  Rovexo/Configbox
 * @author   Rovexo SIA <office@rovexo.com>
 * @license  https://www.configbox.at/eula ConfigBox License
 * @link     https://www.configbox.at
 */
class ConfigboxConfigurator extends \Magento\Catalog\Block\Product\View\Options\AbstractOptions
{
    protected $_prepare;

    /**
     * @param \Magento\Framework\View\Element\Template\Context $context
     * @param \Magento\Framework\Pricing\Helper\Data $pricingHelper
     * @param \Magento\Catalog\Helper\Data $catalogData
     * @param Prepare $prepare
     * @param array $data
     */
    public function __construct(
        \Magento\Framework\View\Element\Template\Context $context,
        \Magento\Framework\Pricing\Helper\Data $pricingHelper,
        \Magento\Catalog\Helper\Data $catalogData,
        Prepare $prepare,
        array $data = array()
    ) {
        parent::__construct($context, $pricingHelper, $catalogData, $data);
        $this->_prepare = $prepare;
    }

    /**
     * @return float
     */
    public function getTaxRate()
    {
        $taxRate = $this->_prepare->getTaxRate($this->getProduct());
        return $taxRate;
    }

    /**
     * @return array
     * @throws \Exception
     */
    public function getConfigInfo()
    {
        $product = $this->getProduct();
        $pre = $product->getPreconfiguredValues();
        $options = $pre->getOptions();

        $option = $this->getOption();
        $optionId = $option->getId();
        $mageProdId = $product->getId();

        if ($options) {
            $configInfo = json_decode($options[$optionId], true);
        } else {
            $configInfo = array(
                'mage_prod_id' => $mageProdId,
                'prod_id' => $this->_prepare->getCbProductId($mageProdId),
                'selections' => array(),
                'position_id' => null,
            );
        }

        return $configInfo;
    }
}
