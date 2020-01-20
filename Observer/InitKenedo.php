<?php

namespace Rovexo\Configbox\Observer;

use Magento\Framework\Event\Observer;
use Magento\Framework\Event\ObserverInterface;
use Rovexo_Configbox_KenedoLoader as KenedoLoader;

/**
 * Class InitKenedo
 *
 * @category Rovexo
 * @package  Rovexo/Configbox
 * @author   Rovexo SIA <office@rovexo.com>
 * @license  https://www.configbox.at/eula ConfigBox License
 * @link     https://www.configbox.at
 */
class InitKenedo implements ObserverInterface
{
    /**
     * Implementation of execute() method
     *
     * @param Observer $observer Observer object
     *
     * @return void
     */
    public function execute(Observer $observer)
    {
        $kenedo = new KenedoLoader();
        $kenedo->initKenedo();
    }
}
