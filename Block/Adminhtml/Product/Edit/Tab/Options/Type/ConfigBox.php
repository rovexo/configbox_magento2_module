<?php

namespace Rovexo\Configbox\Block\Adminhtml\Product\Edit\Tab\Options\Type;

use Exception;
use Magento\Backend\Block\Template\Context;
use Magento\Catalog\Block\Adminhtml\Product\Edit\Tab\Options\Type\AbstractType;
use Magento\Catalog\Model\Config\Source\Product\Options\Price;
use Magento\Framework\Exception\LocalizedException as LocalizedExceptionAlias;
use Magento\Framework\View\Element\Html\Select;
use Rovexo\Configbox\Model\Config\Source\Product\Options\ConfigBox as
    ConfigBoxOptions;
use Rovexo\Configbox\Model\Prepare;

/**
 * Class ConfigBox
 *
 * @category Rovexo
 * @package  Rovexo/Configbox
 * @author   Rovexo SIA <office@rovexo.com>
 * @license  https://www.configbox.at/eula ConfigBox License
 * @link     https://www.configbox.at
 */
class ConfigBox extends AbstractType
{
    protected $_template = 'Rovexo_Configbox::catalog/product/edit/options/type/configbox.phtml';
    protected $_configBoxOptions;
    protected $_prepareModel;
    protected $_request;

    /**
     * ConfigBox constructor.
     *
     * @param Context          $context          Context object
     * @param Price            $optionPrice      Price object
     * @param ConfigBoxOptions $configBoxOptions ConfigBoxOptions object
     * @param Prepare          $prepareModel     Prepare object
     * @param array            $data             data array
     */
    public function __construct(
        Context $context,
        Price $optionPrice,
        ConfigBoxOptions $configBoxOptions,
        Prepare $prepareModel,
        array $data = array()
    ) {
        $this->_configBoxOptions = $configBoxOptions;
        $this->_prepareModel = $prepareModel;
        $this->_request = $context->getRequest();
        parent::__construct($context, $optionPrice, $data);
    }

    /**
     * Override _prepareLayout()
     *
     * @return AbstractType
     * @throws LocalizedExceptionAlias
     */
    // phpcs:ignore
    protected function _prepareLayout()
    {
        $this->setChild(
            'option_config_box_type',
            $this->getLayout()->addBlock(
                Select::class,
                $this->getNameInLayout() . '.option_config_box_type',
                $this->getNameInLayout()
            )->setData(
                array(
                    'id' => 'product_option_<%- data.option_id %>_config_box',
                    'class' => 'config-box-select required-option-select',
                    'name' =>'product[options][<%- data.option_id %>][config_box_id]'
                )
            )
        );

        return parent::_prepareLayout();
    }

    /**
     * Get html of Configbox select HTML
     *
     * @return string
     * @throws Exception
     */
    public function getCbProductHtml()
    {
        $childHtml = $this->getChildBlock('option_config_box_type');
        /** @noinspection PhpMethodParametersCountMismatchInspection */
        $productId =  $this->_request->getParams('id');
        $cbProductId = '';
        if ($productId) {
            $cbProductId = $this->_prepareModel->getCbProductId($cbProductId);
            if ($cbProductId) {
                $childHtml->setValue($cbProductId);
            }
        }

        $childHtml->setOptions($this->_configBoxOptions->toOptionArray());
        return $this->getChildHtml('option_config_box_type');
    }
}
