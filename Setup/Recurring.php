<?php

namespace Rovexo\Configbox\Setup;

use Magento\Framework\Setup\InstallSchemaInterface;
use Magento\Framework\App\Filesystem\DirectoryList;
use Magento\Framework\Setup\ModuleContextInterface;
use Magento\Framework\Setup\SchemaSetupInterface;
use Magento\Framework\Filesystem\Driver\File;
use Rovexo_Configbox_KenedoLoader as KenedoLoader;

/**
 * Class Recurring
 *
 * @category Rovexo
 * @package  Rovexo/Configbox
 * @author   Rovexo SIA <office@rovexo.com>
 * @license  https://www.configbox.at/eula ConfigBox License
 * @link     https://www.configbox.at
 */
class Recurring implements InstallSchemaInterface
{
    protected $_directoryList;

    protected $_file;

    /**
     * Recurring constructor.
     *
     * @param DirectoryList $directoryList DirectoryList object
     * @param File $file
     */
    public function __construct(
        DirectoryList $directoryList,
        File $file
    ) {
        $this->_directoryList = $directoryList;
        $this->_file = $file;
    }

    /**
     * Implementation of install()
     *
     * @param SchemaSetupInterface $setup SchemaSetup object
     * @param ModuleContextInterface $context Context object
     *
     * @return void
     */
    public function install(
        SchemaSetupInterface $setup,
        ModuleContextInterface $context
    ) {
        $this->_applyCbUpgrades($setup);
    }

    /**
     * Trigger's CB's upgrade process (using M2's setup connection)
     * @param SchemaSetupInterface $setup SchemaSetup object
     */
    protected function _applyCbUpgrades($setup)
    {

        $connection = $setup->getConnection();

        // Init Kenedo (which leads to CB's upgrade helper running and setting up the tables)
        $kenedo = new KenedoLoader();
        $kenedo->initKenedo();
        $kenedo->changeDbConnection($connection);
        $kenedo->applyUpdates();
    }
}
