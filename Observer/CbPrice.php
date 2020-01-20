<?php

namespace Rovexo\Configbox\Observer;

use Magento\Framework\Event\Observer;
use Magento\Framework\Event\ObserverInterface;
use Magento\Framework\Registry;
use Rovexo\Configbox\Model\Prepare;
use KenedoModel;

/**
 * Class CbPrice
 *
 * @category Rovexo
 * @package  Rovexo/Configbox
 * @author   Rovexo SIA <office@rovexo.com>
 * @license  https://www.configbox.at/eula ConfigBox License
 * @link     https://www.configbox.at
 */
class CbPrice implements ObserverInterface
{
    /**
     * @var Registry
     */
    protected $registry;

    /**
     * @var Prepare
     */
    protected $prepare;

    /**
     * @param Registry $registry
     * @param Prepare $prepare
     */
    public function __construct(
        Registry $registry, //  @TODO: Replace deprecated code
        Prepare $prepare
    ) {
        $this->registry = $registry;
        $this->prepare = $prepare;
    }

    /**
     * Implementation of execute() method
     *
     * @param Observer $observer Observer object
     *
     * @return CbPrice
     */
    public function execute(Observer $observer)
    {
        $priceConfigObj = $observer->getData('configObj')->getConfig();

        /** @var \Magento\Catalog\Model\Product $product */
        $product = $this->registry->registry('current_product');

        $cbOption = '';
        foreach ($product->getOptions() as $option) {
            if ($option->getType() == 'configbox') {
                $cbOption = $option;
                break;
            }
        }

        if ($cbOption == '') {
            return $this;
        }

        $preConfiguredValues = $product->getPreconfiguredValues()->getOptions();
        $cbOptionData = json_decode($preConfiguredValues[$cbOption->getOptionId()], true);

        if ($product->hasConfigureMode() && ($product->getConfigureMode() === true)) {
            $cbPriceData = [
                'prices' => [
                    'oldPrice' => [
                        'amount' => $cbOptionData['totalGross'],
                        'adjustments' => [],
                    ],
                    'basePrice' => [
                        'amount' => $cbOptionData['totalNet'],
                    ],
                    'finalPrice' => [
                        'amount' => $cbOptionData['totalGross'],
                    ]
                ],
                'type' => $cbOption->getPriceType(),
                'name' => $cbOption->getTitle(),
            ];
        } else {
            $this->prepare->prepareConfigurator();

            $cartPositionModel = KenedoModel::getModel('ConfigboxModelCartPosition');
            $positionDetails = $cartPositionModel->getPositionDetails();

            $cbPriceData = [
                'prices' => [
                    'oldPrice' => [
                        'amount' => $positionDetails->totalUnreducedGross,
                        'adjustments' => [],
                    ],
                    'basePrice' => [
                        'amount' => $positionDetails->totalUnreducedNet,
                    ],
                    'finalPrice' => [
                        'amount' => $positionDetails->totalUnreducedGross,
                    ]
                ],
                'type' => $cbOption->getPriceType(),
                'name' => $cbOption->getTitle(),
            ];
        }

        $priceConfigObj[$cbOption->getOptionId()] = $cbPriceData;
        $observer->getData('configObj')->setConfig($priceConfigObj);

        return $this;
    }
}
