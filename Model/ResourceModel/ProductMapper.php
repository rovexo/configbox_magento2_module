<?php

namespace Rovexo\Configbox\Model\ResourceModel;

use Magento\Framework\Model\ResourceModel\Db\AbstractDb;

/**
 * Class ProductMapper
 *
 * @category Rovexo
 * @package  Rovexo/Configbox
 * @author   Rovexo SIA <office@rovexo.com>
 * @license  https://www.configbox.at/eula ConfigBox License
 * @link     https://www.configbox.at
 */
class ProductMapper extends AbstractDb
{
    /**
     * Initialise with table name and primary key
     *
     * @return void
     */
    // phpcs:ignore
    public function _construct()
    {
        $this->_init('configbox_magento_xref_mprod_cbprod', 'id');
    }
}
