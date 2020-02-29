<?php

namespace Rovexo\Configbox\Plugin\Catalog\Product;

use Magento\Catalog\Model\Product;
use Magento\Catalog\Model\Product\Copier;
use Rovexo\Configbox\Model\MapCbProduct;
use Rovexo\Configbox\Model\Prepare;
use Rovexo\Configbox\Plugin\Ui\DataProvider\Product\Form\Modifier\
                                            CustomOptionsPlugin;

/**
 * Class CopierPlugin
 *
 * @category Rovexo
 * @package  Rovexo/Configbox
 * @author   Rovexo SIA <office@rovexo.com>
 * @license  https://www.configbox.at/eula ConfigBox License
 * @link     https://www.configbox.at
 */
class CopierPlugin
{

    protected $_mapCbProductModel;
    protected $_prepareModel;

    /**
     * CopierPlugin constructor.
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
     * Plugin to save CB product Id on Product Duplicate
     *
     * @param Copier  $subject Copier object
     * @param Product $result  Product object
     * @param Product $product Product object
     *
     * @return Product
     */
    public function afterCopy(Copier $subject, Product $result, Product $product)
    {
        $customOptions = $product->getOptions();
        if ($customOptions) {
            foreach ($customOptions as $optionId => $options) {
                if ($options->getType() == CustomOptionsPlugin::TYPE_CONFIG_BOX) {
                    $cbProductId
                        = $this->_prepareModel->getCbProductId($product->getId());
                    if ($cbProductId) {
                        $this->_mapCbProductModel
                            ->mapCbProductId($cbProductId, $result->getId());
                    }
                }
            }
        }

        return $result;
    }
}
