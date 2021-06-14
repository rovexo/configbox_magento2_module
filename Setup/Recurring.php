<?php

namespace Rovexo\Configbox\Setup;

use Magento\Framework\Exception\FileSystemException;
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
//        $this->_copyLibAssets();
        $this->_applyCbUpgrades($setup);

    }

    /**
     * Copies the CB lib's assets dir to M2's accessible lib/web dir
     * @throws FileSystemException
     */
    protected function _copyLibAssets()
    {

        $sourceDir = $this->_directoryList->getRoot() . DIRECTORY_SEPARATOR .
            "vendor" . DIRECTORY_SEPARATOR . "rovexo" . DIRECTORY_SEPARATOR .
            "configbox-php" . DIRECTORY_SEPARATOR . "src" . DIRECTORY_SEPARATOR .
            "Rovexo" . DIRECTORY_SEPARATOR . "Configbox" . DIRECTORY_SEPARATOR .
            "assets";

        $targetDir = $this->_directoryList->getPath(DirectoryList::LIB_WEB) .
            DIRECTORY_SEPARATOR . "rovexo" . DIRECTORY_SEPARATOR . "configbox" .
            DIRECTORY_SEPARATOR . "assets";

        // On development we use a symlink - if we got one, we ignore the rest
        if (is_link($targetDir)) {
            return;
        }

        // Try removing the existing dir and copying it fresh
        try {
            if ($this->_file->isExists($targetDir)) {
                $this->_file->deleteDirectory($targetDir);
            }

            $this->_file->createDirectory($targetDir);
            $this->_copyDirectory($sourceDir, $targetDir);
        }
        catch (FileSystemException $e) {
            $msg = "\nThe directory 'lib/web/rovexo' could not be recreated.";
            $msg .= " Please make sure this dir is writable and run setup:upgrade again.";
            $phrase = new \Magento\Framework\Phrase($msg);
            throw new FileSystemException($phrase);
        }

    }

    /**
     * Trigger's CB's upgrade process (using M2's setup connection)
     * @param SchemaSetupInterface $setup SchemaSetup object
     */
    protected function _applyCbUpgrades($setup)
    {

        // Set an area code (there's none when this runs via magento module:upgrade)
        // and the lacking area code makes URL generation fail.
//        $objectManager = \Magento\Framework\App\ObjectManager::getInstance();
//        $state =  $objectManager->get('Magento\Framework\App\State');
//
//        try {
//            $state->getAreaCode();
//        }
//        catch (\Exception $e) {
//            $state->setAreaCode(\Magento\Framework\App\Area::AREA_FRONTEND);
//        }

        $connection = $setup->getConnection();

        // Init Kenedo (which leads to CB's upgrade helper running and setting up the tables)
        $kenedo = new KenedoLoader();
        $kenedo->initKenedo();
        $kenedo->changeDbConnection($connection);
        $kenedo->applyUpdates();

    }

    /**
     * Copy directory
     *
     * @param string $src Source
     * @param string $dst Destination
     *
     * @return void
     */
    protected function _copyDirectory($src, $dst)
    {

        // open the source directory
        $dir = opendir($src);

        // Make the destination directory if not exist
        if (!file_exists($dst)) {
            $this->_file->createDirectory($dst);
        }

        // Loop through the files in source directory
        foreach (scandir($src) as $file) {
            if (($file != '.') && ($file != '..')) {
                if (is_dir($src . DIRECTORY_SEPARATOR . $file)) {
                    // Recursively calling copyDirectory method for sub directory
                    $this->_copyDirectory(
                        $src . DIRECTORY_SEPARATOR . $file,
                        $dst . DIRECTORY_SEPARATOR . $file
                    );
                } else {
                    copy(
                        $src . DIRECTORY_SEPARATOR . $file,
                        $dst . DIRECTORY_SEPARATOR . $file
                    );
                }
            }
        }

        closedir($dir);
    }
}
