<?php

namespace Rovexo\Configbox\Model;

use Magento\Framework\Model\AbstractModel;

/**
 * Class ProductMapper
 *
 * @category Rovexo
 * @package  Rovexo/Configbox
 * @author   Rovexo SIA <office@rovexo.com>
 * @license  https://www.configbox.at/eula ConfigBox License
 * @link     https://www.configbox.at
 */
class ProductMapper extends AbstractModel
{
    /**
     * Initialise with resource model
     *
     * @return void
     */
    public function _construct()
    {
        $this->_init(ResourceModel\ProductMapper::class);
    }
}
