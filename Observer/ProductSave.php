<?php

namespace Rovexo\Configbox\Observer;

use Magento\Framework\Event\Observer;
use Magento\Framework\Event\ObserverInterface;
use Rovexo\Configbox\Model\MapCbProduct;
use Rovexo\Configbox\Model\Prepare;
use Rovexo\Configbox\Plugin\Ui\DataProvider\Product\Form\Modifier\CustomOptionsPlugin;

/**
 * Class ProductSave
 *
 * @category Rovexo
 * @package  Rovexo/Configbox
 * @author   Rovexo SIA <office@rovexo.com>
 * @license  https://www.configbox.at/eula ConfigBox License
 * @link     https://www.configbox.at
 */
class ProductSave implements ObserverInterface
{
    protected $_mapCbProductModel;

    protected $_prepareModel;

    /**
     * ProductSave constructor.
     *
     * @param MapCbProduct $mapCbProductModel MapCbProduct object
     * @param Prepare      $prepareModel      Prepare object
     */
    public function __construct(
        MapCbProduct $mapCbProductModel,
        Prepare $prepareModel
    ) {
        $this->_mapCbProductModel = $mapCbProductModel;
        $this->_prepareModel = $prepareModel;
    }

    /**
     * To map Selected magento product with configbox on product save
     *
     * @param Observer $observer product_after_save observer
     *
     * @return $this
     */
    public function execute(Observer $observer)
    {
        $product = $observer->getProduct();
        $productOptions = $product->getOptions();

        if ($productOptions) {
            $isCbOptionExist = false;
            foreach ($productOptions as $optionId => $options) {
                if ($options['type'] == CustomOptionsPlugin::TYPE_CONFIG_BOX) {
                    $isCbOptionExist = true;
                    $cbId = $options['config_box_id'];
                    if ($cbId) {
                        $this->_mapCbProductModel->mapCbProductId(
                            $cbId,
                            $product->getId()
                        );
                    }
                }
            }

            if (!$isCbOptionExist) {
                $cbId = $this->_prepareModel->getCbProductId($product->getId());
                if ($cbId) {
                    $this->_mapCbProductModel->deleteCbProductMapping(
                        $product->getId(),
                        $cbId
                    );
                }
            }
        }

        return $this;
    }
}
