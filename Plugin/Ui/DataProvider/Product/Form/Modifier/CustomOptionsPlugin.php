<?php

namespace Rovexo\Configbox\Plugin\Ui\DataProvider\Product\Form\Modifier;

use Exception;
use Magento\Catalog\Model\Locator\LocatorInterface;
use Magento\Catalog\Ui\DataProvider\Product\Form\Modifier\CustomOptions;
use Magento\Ui\Component\Container;
use Magento\Ui\Component\Form\Element\Select;
use Magento\Ui\Component\Form\Field;
use Rovexo\Configbox\Model\Config\Source\Product\Options\ConfigBox;
use Rovexo\Configbox\Model\Prepare;

/**
 * Class CustomOptionsPlugin
 *
 * @category Rovexo
 * @package  Rovexo/Configbox
 * @author   Rovexo SIA <office@rovexo.com>
 * @license  https://www.configbox.at/eula ConfigBox License
 * @link     https://www.configbox.at
 */
class CustomOptionsPlugin
{
    const FIELD_CONFIG_BOX_SELECT = 'config_box_id';
    const GRID_TYPE_CONFIG_BOX = 'container_config_box';
    const TYPE_CONFIG_BOX = 'configbox';
    const TYPE_OPTION_NAME = 'rovexo';

    protected $configBoxOptions;

    protected $locator;

    protected $prepareModel;

    /**
     * CustomOptionsPlugin constructor.
     *
     * @param ConfigBox        $configBoxOptions ConfigBox object
     * @param LocatorInterface $locator          Locator object
     * @param Prepare          $prepareModel     Prepare object
     */
    public function __construct(
        ConfigBox $configBoxOptions,
        LocatorInterface $locator,
        Prepare $prepareModel
    ) {
        $this->configBoxOptions = $configBoxOptions;
        $this->locator = $locator;
        $this->prepareModel = $prepareModel;
    }

    /**
     * After Plugin to map cb product id with magento custom options
     *
     * @param CustomOptions $subject CustomOptions object
     * @param array         $result  Result Array
     *
     * @return array
     */
    public function afterModifyData(CustomOptions $subject, $result)
    {
        $productId = $this->locator->getProduct()->getId();
        $previousOptions = $result[$productId]['product']['options'];
        if ($previousOptions) {
            foreach ($previousOptions as $index => $option) {
                if ($option['type'] == static::TYPE_CONFIG_BOX) {
                    $cbProductId = $this->_getCbProductId($productId);
                    if ($cbProductId) {
                        // phpcs:ignore
                        $result[$productId]['product']['options'][$index][static::FIELD_CONFIG_BOX_SELECT] = $cbProductId;
                    }
                }
            }
        }
        return $result;
    }

    /**
     * After Plugin to modify Custom options UI  to add Config box element.
     *
     * @param CustomOptions $subject CustomOptions object
     * @param array         $result  Result array
     *
     * @return array
     */
    public function afterModifyMeta(CustomOptions $subject, $result)
    {
        $configBoxOption = [
            static::TYPE_OPTION_NAME => [
                'values' => [static::TYPE_CONFIG_BOX],
                'indexes' => [
                    static::GRID_TYPE_CONFIG_BOX,
                    static::FIELD_CONFIG_BOX_SELECT
                ]
            ]
        ];
        $mergedOptions = array_merge(
            // phpcs:ignore
            $result[CustomOptions::GROUP_CUSTOM_OPTIONS_NAME]['children'][CustomOptions::GRID_OPTIONS_NAME]['children']['record']['children'][CustomOptions::CONTAINER_OPTION]['children'][CustomOptions::CONTAINER_COMMON_NAME]['children'][CustomOptions::FIELD_TYPE_NAME]['arguments']['data']['config']['groupsConfig'],
            $configBoxOption
        );

        // phpcs:ignore
        $result[CustomOptions::GROUP_CUSTOM_OPTIONS_NAME]['children'][CustomOptions::GRID_OPTIONS_NAME]['children']['record']['children'][CustomOptions::CONTAINER_OPTION]['children'][CustomOptions::CONTAINER_COMMON_NAME]['children'][CustomOptions::FIELD_TYPE_NAME]['arguments']['data']['config']['groupsConfig'] = $mergedOptions;

        // phpcs:ignore
        $result[CustomOptions::GROUP_CUSTOM_OPTIONS_NAME]['children'][CustomOptions::GRID_OPTIONS_NAME]['children']['record']['children'][CustomOptions::CONTAINER_OPTION]['children'][static::GRID_TYPE_CONFIG_BOX] = $this->_getConfigBoxConfig(60);

        return $result;
    }

    /**
     * Get configBox configurations
     *
     * @param int $sortOrder Sort order
     *
     * @return array
     */
    private function _getConfigBoxConfig($sortOrder)
    {
        return [
            'arguments' => [
                'data' => [
                    'config' => [
                        'componentType' => Container::NAME,
                        'formElement' => Container::NAME,
                        'component' => 'Magento_Ui/js/form/components/group',
                        'breakLine' => false,
                        'showLabel' => false,
                        // phpcs:ignore
                        'additionalClasses' => 'admin__field-group-columns admin__control-group-equal',
                        'sortOrder' => $sortOrder,
                        'fieldTemplate' => 'Magento_Catalog/form/field',
                        'visible' => false,
                    ],
                ],
            ],
            'children' => [
                // phpcs:ignore
                static::FIELD_CONFIG_BOX_SELECT => $this->_getConfigBoxElementConfig(10),
            ]
        ];
    }

    /**
     * Get ConfigBox element configurations
     *
     * @param int $sortOrder Sort order
     *
     * @return array
     */
    private function _getConfigBoxElementConfig($sortOrder)
    {
        return [
            'arguments' => [
                'data' => [
                    'config' => [
                        'label' => __('Select Configbox Product to Associate'),
                        'formElement' => Select::NAME,
                        'componentType' => Field::NAME,
                        'dataScope' => static::FIELD_CONFIG_BOX_SELECT,
                        'sortOrder' => $sortOrder,
                        'visible' => false,
                        'options' => $this->configBoxOptions->toOptionArray(),
                        'validation' => [
                            'required-entry' => true
                        ]
                    ],
                ],
            ],
        ];
    }

    /**
     * Get CB product ID
     *
     * @param int $magentoProductId Magento product ID
     *
     * @return int|null
     * @throws Exception
     */
    private function _getCbProductId($magentoProductId)
    {
        return $this->prepareModel->getCbProductId($magentoProductId);
    }
}
