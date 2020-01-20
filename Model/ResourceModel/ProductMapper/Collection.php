<?php

namespace Rovexo\Configbox\Model\ResourceModel\ProductMapper;

use Magento\Framework\Model\ResourceModel\Db\Collection\AbstractCollection;
use Rovexo\Configbox\Model\ProductMapper;

/**
 * Class Collection
 *
 * @category Rovexo
 * @package  Rovexo/Configbox
 * @author   Rovexo SIA <office@rovexo.com>
 * @license  https://www.configbox.at/eula ConfigBox License
 * @link     https://www.configbox.at
 */
class Collection extends AbstractCollection
{
    /**
     * Initialize the model and resource model
     *
     * @return void
     */
    // phpcs:ignore
    public function _construct()
    {
        $this->_init(
            ProductMapper::class,
            \Rovexo\Configbox\Model\ResourceModel\ProductMapper::class
        );
    }
}
