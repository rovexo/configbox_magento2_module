<?php

namespace Rovexo\Configbox\Plugin\Ui\DataProvider\Product;

use Magento\Catalog\Ui\DataProvider\Product\ProductCustomOptionsDataProvider;
use Rovexo\Configbox\Model\Prepare;
use Rovexo\Configbox\Plugin\Ui\DataProvider\Product\Form\Modifier\
                                        CustomOptionsPlugin;

/**
 * Class ProductCustomOptionsDataProviderPlugin
 *
 * @category Rovexo
 * @package  Rovexo/Configbox
 * @author   Rovexo SIA <office@rovexo.com>
 * @license  https://www.configbox.at/eula ConfigBox License
 * @link     https://www.configbox.at
 */
class ProductCustomOptionsDataProviderPlugin
{

    protected $_prepareModel;

    /**
     * ProductCustomOptionsDataProviderPlugin constructor.
     *
     * @param Prepare $prepareModel Prepare object
     */
    public function __construct(Prepare $prepareModel)
    {
        $this->_prepareModel = $prepareModel;
    }


    /**
     * Plugin to update Cb product Id on Custom options import
     *
     * @param ProductCustomOptionsDataProvider $subject Data provider object
     * @param array                            $result  Result array
     *
     * @return array
     */
    public function afterGetData(ProductCustomOptionsDataProvider $subject, $result)
    {
        if (!isset($result['items'])) {
            return $result;
        }

        $totalItems = $result['items'];
        $i = 0;
        foreach ($totalItems as $item) {
            if (isset($item['options'])) {
                foreach ($item['options'] as $index => $option) {
                    if ($option['type'] ==CustomOptionsPlugin::TYPE_CONFIG_BOX) {
                        $cbProductId = $this->_prepareModel
                            ->getCbProductId($item['entity_id']);
                        if ($cbProductId) {
                            $result['items'][$i]['options'][$index]
                            [CustomOptionsPlugin::FIELD_CONFIG_BOX_SELECT] = $cbProductId;
                        }
                    }
                }
            }

            $i++;
        }

        return $result;
    }
}
