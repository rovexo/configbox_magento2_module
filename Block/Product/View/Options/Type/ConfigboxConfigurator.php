<?php

namespace Rovexo\Configbox\Block\Product\View\Options\Type;

use Rovexo\Configbox\Model\Prepare;
use KRequest;
use ConfigboxConfiguration;

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
    protected $prepare;

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
        array $data = []
    ) {
        parent::__construct($context, $pricingHelper, $catalogData, $data);
        $this->prepare = $prepare;
    }

    /**
     * Prepare configurator
     *
     * @return void
     */
    public function prepare()
    {
        $this->prepare->prepareConfigurator();
    }

    /**
     * @return int|null
     */
    public function getPageId()
    {
        return KRequest::getInt('page_id');
    }

    /**
     * @return int|null
     */
    public function getCartPositionId()
    {
        return ConfigboxConfiguration::getInstance()->getPositionId();
    }
}
