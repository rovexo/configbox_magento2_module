<?php

namespace Rovexo\Configbox\Observer;

use Magento\Framework\Event\Observer;
use Magento\Framework\Event\ObserverInterface;
use Rovexo\Configbox\Model\MapCbProduct;

/**
 * Class ProductDelete
 *
 * @category Rovexo
 * @package  Rovexo/Configbox
 * @author   Rovexo SIA <office@rovexo.com>
 * @license  https://www.configbox.at/eula ConfigBox License
 * @link     https://www.configbox.at
 */
class ProductDelete implements ObserverInterface
{

    protected $_mapCbProductModel;

    /**
     * ProductDelete constructor.
     *
     * @param MapCbProduct $mapCbProductModel MapCbProduct object
     */
    public function __construct(MapCbProduct $mapCbProductModel)
    {
        $this->_mapCbProductModel = $mapCbProductModel;
    }

    /**
     * To Delete mapping of product delete
     *
     * @param Observer $observer catalog_product_delete_after observer
     *
     * @return $this
     */
    public function execute(Observer $observer)
    {
        $eventProduct = $observer->getEvent()->getProduct();
        if ($eventProduct && $eventProduct->getId()) {
            $this->_mapCbProductModel->deleteCbProductMapping($eventProduct->getId());
        }

        return $this;
    }
}
