<?php

namespace Rovexo\Configbox\Plugin\Catalog\Product;

use Closure;
use Magento\Catalog\Model\Product\Option as CoreOption;
use Magento\Catalog\Model\Product\Option\Type\Factory;
use Magento\Framework\Exception\LocalizedException;
use Rovexo\Configbox\Model\Product\Option\Type\CbConfigurator;

/**
 * Class Option
 *
 * @category Rovexo
 * @package  Rovexo/Configbox
 * @author   Rovexo SIA <office@rovexo.com>
 * @license  https://www.configbox.at/eula ConfigBox License
 * @link     https://www.configbox.at
 */
class Option
{
    protected $_optionTypeFactory;

    /**
     * Option constructor.
     *
     * @param Factory $optionTypeFactory Option type factory object
     */
    public function __construct(
        Factory $optionTypeFactory
    ) {
        $this->_optionTypeFactory = $optionTypeFactory;
    }

    /**
     * Plugin around getGroupByType()
     *
     * @param CoreOption $subject CoreOption object
     * @param Closure    $proceed Closure object
     * @param string     $type    Type
     *
     * @return mixed|string
     */
    public function aroundGetGroupByType(
        CoreOption $subject,
        Closure $proceed,
        $type = ''
    ) {
        $originalResult = $proceed($type);
        if ($originalResult == '') {
            if ($type == 'configbox') {
                return 'configbox';
            }
        }

        return $originalResult;
    }

    /**
     * Plugin around groupFactory()
     *
     * @param CoreOption $subject CoreOption object
     * @param Closure    $proceed Closure object
     * @param string     $type    Type
     *
     * @return CoreOption\Type\DefaultType|mixed
     * @throws LocalizedException
     */
    public function aroundGroupFactory(
        CoreOption $subject,
        Closure $proceed,
        $type
    ) {
        if ($type == 'configbox') {
            return $this->_optionTypeFactory->create(CbConfigurator::class);
        }

        return $proceed($type);
    }
}
